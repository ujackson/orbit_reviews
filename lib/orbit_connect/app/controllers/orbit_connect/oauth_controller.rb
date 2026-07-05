module OrbitConnect
  class OauthController < ApplicationController
    def callback
      connection = OrbitConnect::ConnectionManager.complete_oauth!(
        provider_key: params[:provider],
        code: params[:code],
        state: params[:state]
      )

      redirect_to connection.connection_attempts.order(created_at: :desc).first&.return_to.presence || "/",
                  notice: "#{connection.provider_class.display_name} connected successfully"
    rescue OrbitConnect::Error => e
      OrbitConnect.config.logger.error("[OrbitConnect] OAuth callback failed: #{e.class}: #{e.message}")
      redirect_to "/", alert: e.message
    end
  end
end
