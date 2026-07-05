module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
    before_action :require_workspace
    helper_method :authenticated?
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
      skip_before_action :require_workspace, **options
    end

    def allow_authenticated_without_workspace(**options)
      skip_before_action :require_workspace, **options
    end
  end

  private

  def authenticated?
    !!resume_session
  end

  def require_authentication
    return if resume_session
    request_authentication
  end

  def require_workspace
    return if Current.workspace.present?

    redirect_to setup_path
  end

  def session_cookie_key
    Rails.configuration.auth.fetch(:session_cookie).to_sym
  end

  def session_cookie_value
    cookies[session_cookie_key]
  end

  def set_session_cookie!(value)
    cookies[session_cookie_key] = {
      value: value,
      httponly: true,
      same_site: :lax,
      secure: Rails.env.production? || Rails.env.staging?
    }
  end

  def clear_session_cookie!
    cookies.delete(session_cookie_key)
    Current.user = nil
    Current.workspace = nil
    @session_data = nil
  end

  def resume_session
    return @session_data if defined?(@session_data)

    @session_data =
      case Rails.configuration.auth.fetch(:provider)
      when :workos
        load_workos_session
      else
        nil
      end
  end

  def load_workos_session
    sealed = session_cookie_value
    return nil if sealed.blank?

    w = Rails.configuration.auth.fetch(:workos)

    session = Workos::Client.load_sealed_session(
      client_id: w.fetch(:client_id),
      session_data: sealed,
      cookie_password: w.fetch(:cookie_password)
    )

    result = session.authenticate

    unless result[:authenticated]
      refreshed_result = refresh_workos_session(session)
      return refreshed_result if refreshed_result.present?

      Rails.logger.warn("WorkOS session authentication failed: #{result[:reason] || result['reason']}")
      clear_session_cookie!
      return nil
    end

    Current.user = result[:user]
    org_id = workos_organization_id(result)

    if org_id.blank?
      org_id = auto_select_workos_organization!(session, result[:user])
      result = session.authenticate if org_id.present?
      Current.user = result[:user] if result[:authenticated]
    end

    if org_id.present?
      workspace = ensure_workspace_for_org(org_id)
      Current.workspace = workspace
    end

    result
  rescue => e
    Rails.logger.error "Failed to load session: #{e.class}: #{e.message}"
    clear_session_cookie!
    nil
  end

  def workos_organization_id(result)
    result[:organization_id] || result[:org_id] || result["organization_id"] || result["org_id"]
  end

  def ensure_workspace_for_org(org_id)
    Workspace.find_or_create_by!(remote_id: org_id) do |workspace|
      organization = Workos::Client.get_organization(id: org_id)
      workspace.id = organization.external_id if organization.external_id.present?
    end
  end

  def auto_select_workos_organization!(session, user)
    user_id =
      if user.respond_to?(:id)
        user.id
      elsif user.respond_to?(:[])
        user[:id] || user["id"]
      end

    return nil if user_id.blank?

    memberships = Workos::Client.list_organization_memberships(user_id: user_id).data
    active_memberships = memberships.select { |membership| membership.status.to_s == "active" }
    membership = active_memberships.one? ? active_memberships.first : nil
    return nil if membership.blank?

    refreshed = session.refresh(organization_id: membership.organization_id)
    return nil unless refreshed[:authenticated]

    set_session_cookie!(refreshed[:sealed_session])
    membership.organization_id
  rescue StandardError => e
    Rails.logger.warn("Failed to auto-select WorkOS organization: #{e.class}: #{e.message}")
    nil
  end

  def refresh_workos_session(session)
    expired_result = session.authenticate(include_expired: true)
    user = expired_result[:user] || expired_result["user"]
    org_id = workos_organization_id(expired_result)
    org_id = organization_id_for_user(user) if org_id.blank?
    return nil if org_id.blank?

    refreshed = session.refresh(organization_id: org_id)
    return nil unless refreshed[:authenticated]

    set_session_cookie!(refreshed[:sealed_session])
    Current.user = refreshed[:user] || user
    workspace = ensure_workspace_for_org(org_id)
    Current.workspace = workspace
    refreshed
  rescue StandardError => e
    Rails.logger.warn("Failed to refresh WorkOS session: #{e.class}: #{e.message}")
    nil
  end

  def organization_id_for_user(user)
    user_id =
      if user.respond_to?(:id)
        user.id
      elsif user.respond_to?(:[])
        user[:id] || user["id"]
      end
    return nil if user_id.blank?

    memberships = Workos::Client.list_organization_memberships(user_id: user_id).data
    active_memberships = memberships.select { |membership| membership.status.to_s == "active" }
    active_memberships.one? ? active_memberships.first.organization_id : nil
  end

  def request_authentication
    session[:return_to_after_authenticating] = request.url
    if inertia_request?
      flash[:alert] = "Please sign in to continue."
      inertia_location main_app.login_url
      return
    end

    if request.format.json? || request.xhr?
      render json: { error: "Authentication required", loginUrl: main_app.login_path }, status: :unauthorized
      return
    end

    redirect_to main_app.login_path
  end

  def inertia_request?
    request.headers["X-Inertia"].present?
  end

  def after_authentication_url
    session.delete(:return_to_after_authenticating) || main_app.root_path
  end
end
