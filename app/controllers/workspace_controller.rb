# frozen_string_literal: true

class WorkspaceController < InertiaController
  def home
    redirect_to workspace_path(Current.workspace.id)
  end

  def switch
    requested_workspace = Workspace.find_by(id: params[:workspace_id]) || Workspace.find_by(remote_id: params[:workspace_id])
    organization_id = requested_workspace&.remote_id || params[:workspace_id]

    workos_config = Rails.configuration.auth.fetch(:workos)
    workos_session = Workos::Client.load_sealed_session(
      client_id: workos_config.fetch(:client_id),
      session_data: session_cookie_value,
      cookie_password: workos_config.fetch(:cookie_password)
    )

    refreshed = workos_session.refresh(organization_id:)
    unless refreshed[:authenticated]
      redirect_to workspace_path(Current.workspace.id), flash: { error: "Unable to switch workspace." }
      return
    end

    set_session_cookie!(refreshed.fetch(:sealed_session))
    Current.workspace = ensure_workspace_for_org(organization_id)

    redirect_to workspace_path(Current.workspace.id), flash: { success: "Switched to #{Current.workspace.display_name}." }
  rescue StandardError => e
    Rails.logger.warn("Workspace switch failed: #{e.class}: #{e.message}")
    redirect_to workspace_path(Current.workspace.id), flash: { error: "Unable to switch workspace." }
  end
end
