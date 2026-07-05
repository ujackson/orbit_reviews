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
  inertia_share currentUser: -> {
    UserSerializer.new(Current.user).to_h if Current.user.present?
  }
  inertia_share authRoutes: -> {
    {
      login: main_app.login_path,
      logout: main_app.logout_path
    }
  }
end
