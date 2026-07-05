require "test_helper"
require "ostruct"

class SetupControllerTest < ActionDispatch::IntegrationTest
  test "show exposes camelCase setup form props even when session stores snake_case data" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    fake_session = FakeWorkosSession.new(user: user)
    cookies[:app_session] = "sealed"

    with_singleton_stub(WorkOS::UserManagement, :load_sealed_session, fake_session) do
      get setup_step_path(step: "workspace")
      assert_response :success

      patch setup_path, params: { step: "workspace", workspace_name: "Acme", industry: "SaaS" }
      follow_redirect!
      assert_response :success

      assert_includes @response.body, "\"workspaceName\":\"Acme\""
      assert_includes @response.body, "\"industry\":\"SaaS\""
      refute_includes @response.body, "\"workspace_name\""
      refute_includes @response.body, "\"team_size\""
      refute_includes @response.body, "\"use_cases\""
    end
  end

  test "complete setup provisions workspace and redirects home" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    fake_session = FakeWorkosSession.new(user: user)
    organization = OpenStruct.new(id: "org_123")
    organization_snapshot = OpenStruct.new(
      id: organization.id,
      name: "Acme",
      external_id: nil,
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )
    cookies[:app_session] = "sealed"

    with_singleton_stub(WorkOS::UserManagement, :load_sealed_session, fake_session) do
      with_singleton_stub(Workos::OrganizationsApi, :create_organization!, organization) do
        with_singleton_stub(WorkOS::Organizations, :get_organization, organization_snapshot) do
          with_singleton_stub(WorkOS::UserManagement, :create_organization_membership, true) do
          get setup_step_path(step: "workspace")
          assert_response :success

          patch setup_path, params: { step: "workspace", workspace_name: "Acme", industry: "SaaS" }
          assert_redirected_to setup_step_path(step: "team")

          patch setup_path, params: { step: "team", team_size: "2-10", role: "Founder" }
          assert_redirected_to setup_step_path(step: "channels")

          patch setup_path, params: { step: "channels", use_cases: [ "support" ], channels: [ "email" ] }
          assert_redirected_to setup_step_path(step: "complete")

          patch setup_path, params: { step: "complete" }
          workspace = Workspace.find_by(remote_id: "org_123")
          assert_not_nil workspace
          assert_redirected_to workspace_settings_path(workspace.id, onboarding: "1")

          follow_redirect!
          assert_response :success
          assert_includes @response.body, "\"component\":\"Settings\""
          assert_includes @response.body, "\"workspace\""

          assert_equal organization.id, workspace.remote_id
          assert_equal "Acme Corp", workspace.name
        end
      end
      end
    end
  end

  test "redirect after setup resumes workspace from organization_id session key" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    workspace = Workspace.create!(
      id: SecureRandom.uuid,
      remote_id: "org_123"
    )
    organization_snapshot = OpenStruct.new(
      id: workspace.remote_id,
      name: "Acme",
      external_id: workspace.id,
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )

    cookies[:app_session] = "sealed"

    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeOrganizationKeySession.new(user: user, organization_id: workspace.remote_id)
    ) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, organization_snapshot) do
        get root_path
      end
    end

    assert_redirected_to workspace_path(workspace.id)
  end

  test "existing workos org recreates local workspace instead of redirecting to setup" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    organization_snapshot = OpenStruct.new(
      id: "org_123",
      name: "Acme",
      external_id: SecureRandom.uuid,
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )

    cookies[:app_session] = "sealed"

    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeOrganizationKeySession.new(user: user, organization_id: organization_snapshot.id)
    ) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, organization_snapshot) do
        get root_path
      end
    end

    workspace = Workspace.find_by(remote_id: organization_snapshot.id)
    assert_not_nil workspace
    assert_redirected_to workspace_path(workspace.id)
    assert_equal organization_snapshot.external_id, workspace.id
  end

  test "setup show redirects home when workos session already resolves a workspace" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    organization_snapshot = OpenStruct.new(
      id: "org_123",
      name: "Acme",
      external_id: SecureRandom.uuid,
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )

    cookies[:app_session] = "sealed"

    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeOrganizationKeySession.new(user: user, organization_id: organization_snapshot.id)
    ) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, organization_snapshot) do
        get setup_step_path(step: "workspace")
      end
    end

    workspace = Workspace.find_by(remote_id: organization_snapshot.id)
    assert_not_nil workspace
    assert_redirected_to workspace_path(workspace.id)
  end

  test "user with one active workos membership is not sent back through setup" do
    user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
    organization_snapshot = OpenStruct.new(
      id: "org_123",
      name: "Acme",
      external_id: SecureRandom.uuid,
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )
    membership = OpenStruct.new(organization_id: organization_snapshot.id, status: "active")
    cookies[:app_session] = "sealed"

    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeSelectableSession.new(user: user)
    ) do
      with_singleton_stub(
        WorkOS::UserManagement,
        :list_organization_memberships,
        OpenStruct.new(data: [ membership ])
      ) do
        with_singleton_stub(WorkOS::Organizations, :get_organization, organization_snapshot) do
          get root_path
        end
      end
    end

    workspace = Workspace.find_by(remote_id: organization_snapshot.id)
    assert_not_nil workspace
    assert_redirected_to workspace_path(workspace.id)
  end

  private

  class FakeWorkosSession
    def initialize(user:)
      @user = user
      @organization_id = nil
    end

    def authenticate(include_expired: false)
      {
        authenticated: true,
        user: @user,
        org_id: @organization_id,
        session_id: "session_123"
      }
    end

    def refresh(organization_id:)
      @organization_id = organization_id
      {
        authenticated: true,
        sealed_session: "fresh-session"
      }
    end
  end

  class FakeOrganizationKeySession
    def initialize(user:, organization_id:)
      @user = user
      @organization_id = organization_id
    end

    def authenticate(include_expired: false)
      {
        authenticated: true,
        user: @user,
        organization_id: @organization_id,
        session_id: "session_123"
      }
    end
  end

  class FakeSelectableSession
    def initialize(user:)
      @user = user
      @organization_id = nil
    end

    def authenticate(include_expired: false)
      {
        authenticated: true,
        user: @user,
        organization_id: @organization_id,
        session_id: "session_123"
      }
    end

    def refresh(organization_id:)
      @organization_id = organization_id
      {
        authenticated: true,
        sealed_session: "selected-session"
      }
    end
  end
end
