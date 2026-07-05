class AuthController < ApplicationController
  allow_unauthenticated_access only: %i[login callback]

  def login
    if params[:auth_failed].present?
      render plain: "Authentication failed. Please clear the WorkOS session and try signing in again.", status: :unauthorized
      return
    end

    w = Rails.configuration.auth.fetch(:workos)

    authorization_url = Workos::Client.authorization_url(
      provider: w.fetch(:provider),
      client_id: w.fetch(:client_id),
      redirect_uri: w.fetch(:redirect_url)
    )

    redirect_to authorization_url, allow_other_host: true
  end

  def callback
    w = Rails.configuration.auth.fetch(:workos)

    auth = Workos::Client.authenticate_with_code(
      client_id: w.fetch(:client_id),
      code: params[:code],
      session: {
        seal_session: true,
        cookie_password: w.fetch(:cookie_password)
      }
    )

    set_session_cookie!(auth.sealed_session)

    # Load and authenticate session
    result = resume_session

    unless result&.[](:authenticated)
      clear_session_cookie!
      return redirect_to(main_app.login_path, alert: "Authentication failed")
    end

    org_id = workos_organization_id(result)

    if org_id.present?
      workspace = ensure_workspace_for_org(org_id)
      Current.workspace = workspace
      redirect_to after_authentication_url
    else
      redirect_to setup_path
    end
  rescue => e
    Rails.logger.error "Auth callback error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    clear_session_cookie!
    redirect_to main_app.login_path(auth_failed: "1"), alert: "Authentication failed"
  end

  def logout
    w = Rails.configuration.auth.fetch(:workos)

    session_data = Workos::Client.load_sealed_session(
      client_id: w.fetch(:client_id),
      session_data: session_cookie_value,
      cookie_password: w.fetch(:cookie_password)
    )

    logout_url = session_data.get_logout_url
    clear_session_cookie!
    redirect_to logout_url, allow_other_host: true
  rescue => e
    Rails.logger.error "Logout error: #{e.class}: #{e.message}"
    clear_session_cookie!
    redirect_to root_path
  end
end
