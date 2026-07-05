require "test_helper"
require "openssl"

class OrbitConnectWebhooksControllerTest < ActionDispatch::IntegrationTest
  test "Slack webhook verifies with workspace provider app secret and links connection" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    provider_app = OrbitConnect::ProviderApp.create!(
      provider_key: "slack",
      environment: Rails.env,
      name: "Slack OAuth",
      client_id: "slack-client-id",
      client_secret: "slack-client-secret",
      webhook_signing_secret: "slack-signing-secret",
      workspace_id: workspace.id,
      active: true
    )
    connection = OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "slack",
      provider_app: provider_app,
      external_account_id: "T123",
      status: "connected"
    )

    body = {
      event_id: "Ev123",
      team_id: "T123",
      type: "event_callback",
      event: { type: "message", event_ts: "1710000000.000100" }
    }.to_json
    timestamp = Time.current.to_i.to_s
    signature = "v0=" + OpenSSL::HMAC.hexdigest("SHA256", "slack-signing-secret", "v0:#{timestamp}:#{body}")

    assert_difference "OrbitConnect::WebhookEvent.count", 1 do
      post "/orbit_connect/webhooks/slack",
           params: body,
           headers: {
             "CONTENT_TYPE" => "application/json",
             "X-Slack-Request-Timestamp" => timestamp,
             "X-Slack-Signature" => signature
           }
    end

    assert_response :accepted

    event = OrbitConnect::WebhookEvent.find_by!(event_uid: "Ev123")
    assert_equal connection, event.connection
    assert_equal "slack", event.provider_key
  end
end
