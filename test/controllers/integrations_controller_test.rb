require "test_helper"
require "ostruct"

class IntegrationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @organization = OpenStruct.new(
      id: @workspace.remote_id,
      external_id: @workspace.id,
      name: "Acme",
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )
    cookies[:app_session] = "sealed"
  end

  test "connect reports OAuth setup required before creating a connection" do
    OrbitConnect::ProviderApp.where(provider_key: "gmail", environment: Rails.env).delete_all

    with_authenticated_workspace do
      assert_no_difference "OrbitConnect::Connection.count" do
        post connect_integration_path(workspace_id: @workspace.id, provider_key: "gmail")
      end
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal true, body["setupRequired"]
    assert_equal "gmail", body["providerKey"]
    assert_equal "Gmail", body["providerName"]
    assert_equal "#{OrbitConnect.config.oauth_callback_base_url}/integrations/oauth/gmail/callback", body["redirectUri"]
    assert_nil body["webhookUrl"]
    assert_equal "#{OrbitConnect.config.oauth_callback_base_url}/integrations/gmail/pubsub", body["gmailPubsubUrl"]
    refute_includes @response.body, "google-client-secret"
  end

  test "connect reports Slack setup with webhook request url before creating a connection" do
    OrbitConnect::ProviderApp.where(provider_key: "slack", environment: Rails.env).delete_all

    with_authenticated_workspace do
      assert_no_difference "OrbitConnect::Connection.count" do
        post connect_integration_path(workspace_id: @workspace.id, provider_key: "slack")
      end
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal true, body["setupRequired"]
    assert_equal "slack", body["providerKey"]
    assert_equal "Slack", body["providerName"]
    assert_equal "#{OrbitConnect.config.oauth_callback_base_url}/orbit_connect/webhooks/slack", body["webhookUrl"]
    assert_equal true, body["webhookSupported"]
    assert_includes body.fetch("fields").map { |field| field["name"] }, "webhookSigningSecret"
  end

  test "provider_app stores OAuth credentials workspace scoped without returning the secret" do
    with_authenticated_workspace do
      post configure_integration_provider_app_path(workspace_id: @workspace.id, provider_key: "gmail"),
           params: {
             name: "Acme Gmail OAuth",
             clientId: "google-client-id",
             clientSecret: "google-client-secret",
             gmailPubsubTopic: "projects/acme/topics/gmail",
             gmailPubsubVerificationToken: "pubsub-secret"
           }
    end

    assert_response :success

    provider_app = OrbitConnect::ProviderApp.find_by!(
      provider_key: "gmail",
      environment: Rails.env,
      workspace_id: @workspace.id
    )
    assert_equal "Acme Gmail OAuth", provider_app.name
    assert_equal "google-client-id", provider_app.client_id
    assert_equal "google-client-secret", provider_app.client_secret
    assert_equal "projects/acme/topics/gmail", provider_app.gmail_pubsub_topic
    assert_equal "pubsub-secret", provider_app.webhook_secret

    body = JSON.parse(@response.body)
    assert_equal true, body.dig("providerApp", "configured")
    assert_equal true, body.dig("providerApp", "webhookConfigured")
    refute_includes @response.body, "google-client-secret"
    refute_includes @response.body, "pubsub-secret"
  end

  test "provider_app stores Slack webhook signing secret without returning it" do
    with_authenticated_workspace do
      post configure_integration_provider_app_path(workspace_id: @workspace.id, provider_key: "slack"),
           params: {
             name: "Acme Slack OAuth",
             clientId: "slack-client-id",
             clientSecret: "slack-client-secret",
             webhookSigningSecret: "slack-signing-secret"
           }
    end

    assert_response :success

    provider_app = OrbitConnect::ProviderApp.find_by!(
      provider_key: "slack",
      environment: Rails.env,
      workspace_id: @workspace.id
    )
    assert_equal "Acme Slack OAuth", provider_app.name
    assert_equal "slack-client-id", provider_app.client_id
    assert_equal "slack-client-secret", provider_app.client_secret
    assert_equal "slack-signing-secret", provider_app.webhook_secret

    body = JSON.parse(@response.body)
    assert_equal true, body.dig("providerApp", "configured")
    assert_equal true, body.dig("providerApp", "webhookConfigured")
    refute_includes @response.body, "slack-client-secret"
    refute_includes @response.body, "slack-signing-secret"
  end

  test "index returns canonical connected connection over newer pending duplicate" do
    connected = OrbitConnect::Connection.create!(
      workspace: @workspace,
      provider_key: "gmail",
      status: "connected",
      external_name: "user@example.com",
      created_at: 2.days.ago,
      updated_at: 2.days.ago
    )
    OrbitConnect::Connection.create!(
      workspace: @workspace,
      provider_key: "gmail",
      status: "pending",
      created_at: 1.hour.ago,
      updated_at: 1.hour.ago
    )

    with_authenticated_workspace do
      get workspace_integrations_path(workspace_id: @workspace.id)
    end

    assert_response :success

    body = JSON.parse(@response.body)
    gmail_connections = body.fetch("connections").select { |connection| connection["integrationId"] == "gmail" }
    assert_equal 1, gmail_connections.length
    assert_equal connected.id, gmail_connections.first["id"]
    assert_equal "connected", gmail_connections.first["status"]
  end

  test "disconnect marks workspace connection disconnected" do
    connection = OrbitConnect::Connection.create!(
      workspace: @workspace,
      provider_key: "generic_api_key",
      status: "connected"
    )
    OrbitConnect::Credential.create!(
      connection: connection,
      credential_type: "api_key",
      api_key: "secret-api-key"
    )

    with_authenticated_workspace do
      delete disconnect_integration_path(workspace_id: @workspace.id, id: connection.id)
    end

    assert_response :success
    assert_equal "disconnected", connection.reload.status
    assert_nil connection.credential.reload.api_key
  end

  test "sync endpoint enqueues manual sync for workspace connection" do
    connection = OrbitConnect::Connection.create!(
      workspace: @workspace,
      provider_key: "gmail",
      status: "connected"
    )

    assert_enqueued_jobs 1, only: OrbitConnect::SyncConnectionJob do
      with_authenticated_workspace do
        post sync_integration_path(workspace_id: @workspace.id, id: connection.id)
      end
    end

    assert_response :success
  end

  private

  def with_authenticated_workspace(&block)
    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeSession.new(user: OpenStruct.new(id: "user_123", email: "founder@acme.com"), organization_id: @workspace.remote_id)
    ) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, @organization, &block)
    end
  end

  class FakeSession
    def initialize(user:, organization_id:)
      @user = user
      @organization_id = organization_id
    end

    def authenticate(include_expired: false)
      {
        authenticated: true,
        user: @user,
        org_id: @organization_id,
        session_id: "session_123"
      }
    end
  end
end
