# frozen_string_literal: true

class InertiaController < ApplicationController
  # Share data with all Inertia responses
  # see https://inertia-rails.dev/guide/shared-data
  inertia_share flash: -> {
    {
      notice: flash[:notice],
      alert: flash[:alert],
      success: flash[:success],
      error: flash[:error]
    }
  }
  inertia_share currentWorkspace: -> {
    WorkspaceSerializer.new(Current.workspace).to_h if Current.workspace.present?
  }
  inertia_share workspaces: -> {
    available_workspaces.map { |workspace| WorkspaceSerializer.new(workspace).to_h } if Current.workspace.present?
  }
  inertia_share currentUser: -> {
    UserSerializer.new(Current.user).to_h if Current.user.present?
  }
  inertia_share authRoutes: -> {
    {
      login: main_app.login_path,
      logout: main_app.logout_path
    }
  }

  private

  def available_workspaces
    workos_user_id = current_workos_user_id
    return local_workspaces if workos_user_id.blank?

    memberships = Workos::Client.list_organization_memberships(user_id: workos_user_id).data
    active_org_ids = memberships.select { |membership| membership.status.to_s == "active" }.map(&:organization_id)
    workspaces = active_org_ids.filter_map { |org_id| ensure_workspace_for_org(org_id) }
    workspaces.presence || local_workspaces
  rescue StandardError => e
    Rails.logger.warn("Unable to load WorkOS workspace memberships: #{e.class}: #{e.message}")
    local_workspaces
  end

  def local_workspaces
    Workspace.order(:created_at)
  end

  def current_workos_user_id
    user = Current.user
    return user.id if user.respond_to?(:id)
    return user[:id] || user["id"] if user.respond_to?(:[])

    nil
  end
end
