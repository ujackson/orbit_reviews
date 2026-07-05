module Setup
  class CompleteWorkspaceProvisioning
    Result = Struct.new(:workspace, :organization, :sealed_session, keyword_init: true)

    def initialize(user:, sealed_session:, cookie_password:, client_id:, setup_data:)
      @user = user
      @sealed_session = sealed_session
      @cookie_password = cookie_password
      @client_id = client_id
      @setup_data = setup_data.with_indifferent_access
    end

    def call
      raise ArgumentError, "user is required" if user.blank?
      raise ArgumentError, "sealed_session is required" if sealed_session.blank?
      raise ArgumentError, "workspace_name is required" if workspace_name.blank?

      organization = create_organization
      workspace = create_workspace!(organization)
      create_membership!(organization)
      refreshed_session = refresh_session!(organization)

      Result.new(
        workspace: workspace,
        organization: organization,
        sealed_session: refreshed_session.fetch(:sealed_session)
      )
    rescue
      cleanup_workspace!(workspace)
      cleanup_organization!(organization)
      raise
    end

    private

    attr_reader :user, :sealed_session, :cookie_password, :client_id, :setup_data

    def workspace_name
      setup_data[:workspace_name]
    end

    def workspace_uuid
      @workspace_uuid ||= SecureRandom.uuid
    end

    def recommended_domain
      @recommended_domain ||= EmailClassifier.recommended_organization_domain(user_email)
    end

    def user_email
      @user_email ||= EmailClassifier.extract_email(user)
    end

    def create_organization
      Workos::OrganizationsApi.create_organization!(
        name: workspace_name,
        external_id: workspace_uuid,
        domain_data: recommended_domain.present? ? [ { domain: recommended_domain, state: "pending" } ] : nil,
        metadata: organization_metadata
      )
    end

    def create_workspace!(organization)
      Workspace.create!(
        id: workspace_uuid,
        remote_id: organization.id
      )
    end

    def create_membership!(organization)
      Workos::Client.create_organization_membership(
        user_id: user_id,
        organization_id: organization.id
      )
    end

    def refresh_session!(organization)
      session = Workos::Client.load_sealed_session(
        client_id: client_id,
        session_data: sealed_session,
        cookie_password: cookie_password
      )

      result = session.refresh(organization_id: organization.id)
      return result if result[:authenticated]

      raise "Failed to refresh WorkOS session: #{result[:reason]}"
    end
    def user_id
      if user.respond_to?(:id)
        user.id
      elsif user.respond_to?(:[])
        user[:id] || user["id"]
      end
    end

    def cleanup_workspace!(workspace)
      workspace&.destroy!
    rescue StandardError
      nil
    end

    def cleanup_organization!(organization)
      return if organization.blank?

      Workos::Client.delete_organization(id: organization.id)
    rescue StandardError
      nil
    end

    def organization_metadata
      {
        industry: setup_data[:industry],
        team_size: setup_data[:team_size],
        role: setup_data[:role],
        use_cases: Array(setup_data[:use_cases]).presence,
        channels: Array(setup_data[:channels]).presence
      }.compact
    end
  end
end
