require "test_helper"

class AuthControllerTest < ActionDispatch::IntegrationTest
  test "login redirects to workos authorization url" do
    with_singleton_stub(WorkOS::UserManagement, :authorization_url, "https://workos.example/authorize") do
      get login_path
    end

    assert_response :redirect
    assert_redirected_to "https://workos.example/authorize"
  end

  test "unauthenticated inertia request redirects instead of returning json" do
    get workspace_settings_path(workspace_id: SecureRandom.uuid),
        headers: {
          "X-Inertia" => "true",
          "X-Inertia-Version" => ViteRuby.digest.to_s
        }

    assert_response :conflict
    assert_equal login_url, @response.headers["X-Inertia-Location"]
    assert_empty @response.body
  end

  test "unauthenticated api json request returns json unauthorized" do
    get api_conversations_path(workspace_id: SecureRandom.uuid), as: :json

    assert_response :unauthorized
    assert_equal "Authentication required", JSON.parse(@response.body)["error"]
  end
end
