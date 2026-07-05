require "test_helper"
require "base64"

class IntegrationsGmailPubsubControllerTest < ActionDispatch::IntegrationTest
  test "accepts Pub/Sub push only when token matches the connection provider app" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    provider_app = OrbitConnect::ProviderApp.create!(
      provider_key: "gmail",
      environment: Rails.env,
      name: "Gmail OAuth",
      client_id: "client-id",
      client_secret: "client-secret",
      webhook_signing_secret: "pubsub-secret",
      config: { "gmail_pubsub_topic" => "projects/acme/topics/gmail" },
      workspace_id: workspace.id,
      active: true
    )
    connection = OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "gmail",
      provider_app: provider_app,
      external_account_id: "user@example.com",
      status: "connected"
    )
    payload = {
      message: {
        data: Base64.strict_encode64({ emailAddress: "user@example.com", historyId: "12345" }.to_json)
      }
    }

    assert_no_enqueued_jobs only: OrbitConnect::SyncConnectionJob do
      post gmail_pubsub_webhook_path(token: "wrong"), params: payload
    end
    assert_response :unauthorized

    assert_enqueued_jobs 1, only: OrbitConnect::SyncConnectionJob do
      post gmail_pubsub_webhook_path(token: "pubsub-secret"), params: payload
    end
    assert_response :accepted

    state = connection.sync_states.find_by!(resource_name: "gmail_history")
    assert_equal "12345", state.metadata["pending_history_id"]
  end
end
