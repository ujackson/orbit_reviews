require "test_helper"
require "ostruct"

module Setup
  class CompleteWorkspaceProvisioningTest < ActiveSupport::TestCase
    test "creates local workspace, workos org with metadata, membership, and refreshed session" do
      user = OpenStruct.new(id: "user_123", email: "founder@acme.com")
      organization = OpenStruct.new(id: "org_123")
      fake_session = FakeWorkosSession.new(user: user)
      captured_args = nil

      with_singleton_stub(Workos::OrganizationsApi, :create_organization!, implementation: ->(**kwargs) {
        captured_args = kwargs
        organization
      }) do
        with_singleton_stub(WorkOS::UserManagement, :create_organization_membership, true) do
          with_singleton_stub(WorkOS::UserManagement, :load_sealed_session, fake_session) do
            result = CompleteWorkspaceProvisioning.new(
              user: user,
              sealed_session: "sealed",
              cookie_password: "password",
              client_id: "client_123",
              setup_data: {
                workspace_name: "Acme",
                industry: "SaaS",
                team_size: "2-10",
                role: "Founder",
                use_cases: [ "support" ],
                channels: [ "email" ]
              }
            ).call

            assert_equal "org_123", result.workspace.remote_id
            assert_equal "sealed-for-org_123", result.sealed_session
            assert_equal "Acme", captured_args[:name]
            assert_equal "SaaS", captured_args.dig(:metadata, :industry)
            assert_equal "2-10", captured_args.dig(:metadata, :team_size)
            assert_equal [ "support" ], captured_args.dig(:metadata, :use_cases)
            assert_equal [ "email" ], captured_args.dig(:metadata, :channels)
          end
        end
      end
    end

    class FakeWorkosSession
      def initialize(user:)
        @user = user
      end

      def refresh(organization_id:)
        { authenticated: true, sealed_session: "sealed-for-#{organization_id}" }
      end
    end
  end
end
