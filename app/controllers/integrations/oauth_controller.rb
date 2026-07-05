# frozen_string_literal: true

module Integrations
  class OauthController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [:callback]
    skip_before_action :require_authentication, only: [:callback]
    skip_before_action :require_workspace, only: [:callback]

    # GET /integrations/oauth/:provider_key/callback
    def callback
      connection = OrbitConnect::ConnectionManager.complete_oauth!(
        provider_key: params[:provider_key],
        code: params[:code],
        state: params[:state]
      )

      redirect_to workspace_settings_url(workspace_id: connection.workspace_id),
                  flash: { success: "#{connection.provider.class.display_name} connected successfully" }
    rescue OrbitConnect::InvalidState => e
      redirect_to root_path, alert: "Authorization failed: #{e.message}"
    rescue OrbitConnect::Error => e
      Rails.logger.error("OAuth callback error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      redirect_to root_path, alert: "Failed to connect: #{e.message}"
    end
  end
end
