require "test_helper"

class IntegrationsOauthControllerTest < ActionDispatch::IntegrationTest
  test "callback redirects to settings with Inertia success flash" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    connection = OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "gmail",
      status: "connected"
    )

    with_singleton_stub(OrbitConnect::ConnectionManager, :complete_oauth!, connection) do
      get integration_oauth_callback_path(provider_key: "gmail", code: "code", state: "state")
    end

    assert_redirected_to workspace_settings_url(workspace_id: workspace.id)
    assert_equal "Gmail connected successfully", flash[:success]
  end
end
