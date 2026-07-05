require "test_helper"
require "ostruct"

class OrbitConnectConnectionManagerTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @provider_app = OrbitConnect::ProviderApp.create!(
      provider_key: "gmail",
      environment: Rails.env,
      name: "Gmail test app",
      client_id: "client-id",
      client_secret: "client-secret",
      active: true,
      workspace_id: nil
    )

    @old_callback_base_url = OrbitConnect.config.oauth_callback_base_url
    @old_callback_path = OrbitConnect.config.oauth_callback_path
    OrbitConnect.config.oauth_callback_base_url = "http://orbit.test"
    OrbitConnect.config.oauth_callback_path = "/integrations/oauth"
  end

  teardown do
    OrbitConnect.config.oauth_callback_base_url = @old_callback_base_url
    OrbitConnect.config.oauth_callback_path = @old_callback_path
  end

  test "starts Gmail OAuth with workspace scoped state and host callback url" do
    result = OrbitConnect::ConnectionManager.start!(
      provider_key: "gmail",
      workspace: @workspace,
      initiator: OpenStruct.new(id: "workos_user_123"),
      return_to: "/w/#{@workspace.id}/settings"
    )

    assert result.redirect?
    assert_includes CGI.unescape(result.redirect_url), "redirect_uri=http://orbit.test/integrations/oauth/gmail/callback"

    attempt = OrbitConnect::ConnectionAttempt.order(:created_at).last
    assert_equal @workspace, attempt.workspace
    assert_nil attempt.initiator
    assert_equal "/w/#{@workspace.id}/settings", attempt.return_to
  end

  test "starting Gmail OAuth twice reuses the workspace provider connection" do
    assert_difference "OrbitConnect::Connection.count", 1 do
      2.times do
        OrbitConnect::ConnectionManager.start!(
          provider_key: "gmail",
          workspace: @workspace,
          return_to: "/w/#{@workspace.id}/settings"
        )
      end
    end

    connection = OrbitConnect::Connection.find_by!(workspace_id: @workspace.id, provider_key: "gmail")
    assert_equal 2, connection.connection_attempts.count
  end

  test "Gmail OAuth start requires configured provider app before creating a connection" do
    OrbitConnect::ProviderApp.where(provider_key: "gmail", environment: Rails.env).delete_all

    assert_no_difference "OrbitConnect::Connection.count" do
      error = assert_raises(OrbitConnect::ConfigError) do
        OrbitConnect::ConnectionManager.start!(
          provider_key: "gmail",
          workspace: @workspace,
          return_to: "/w/#{@workspace.id}/settings"
        )
      end

      assert_match(/OAuth app is not configured/, error.message)
    end
  end

  test "rejects credentials submission for OAuth providers before creating a connection" do
    assert_no_difference "OrbitConnect::Connection.count" do
      error = assert_raises(OrbitConnect::ValidationError) do
        OrbitConnect::ConnectionManager.submit_credentials!(
          provider_key: "gmail",
          workspace: @workspace,
          credentials: { account_email: "user@example.com" }
        )
      end

      assert_match(/uses OAuth/, error.message)
    end
  end
end
