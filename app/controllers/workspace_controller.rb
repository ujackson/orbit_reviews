# frozen_string_literal: true

class WorkspaceController < InertiaController
  def home
    redirect_to workspace_path(Current.workspace.id)
  end

  def inbox
    render_workspace(current_view: "inbox", inbox_view_id: normalized_inbox_view)
  end

  def contacts
    render_workspace(current_view: "contacts")
  end

  def rules
    render_workspace(current_view: "rules")
  end

  def settings
    render_workspace(current_view: "settings", settings_section: "integrations")
  end

  private

  def render_workspace(current_view:, inbox_view_id: "all", settings_section: "integrations")
    render inertia: "workspace/index", props: {
      currentWorkspace: WorkspaceSerializer.new(Current.workspace).to_h,
      currentView: current_view,
      inboxViewId: inbox_view_id,
      settingsSection: settings_section,
      integrationOnboarding: params[:onboarding] == "1",
      rails_version: Rails.version,
      ruby_version: RUBY_DESCRIPTION,
      rack_version: Rack.release,
      inertia_rails_version: InertiaRails::VERSION
    }
  end

  def normalized_inbox_view
    %w[all assigned mentions ai-queue closed].include?(params[:view_id]) ? params[:view_id] : "all"
  end
end
