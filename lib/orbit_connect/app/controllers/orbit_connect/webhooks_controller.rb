module OrbitConnect
  class WebhooksController < ApplicationController
    protect_from_forgery with: :null_session

    def create
      result = OrbitConnect::WebhookIngestor.ingest!(
        provider_key: params[:provider],
        raw_body: request.raw_post,
        headers: request.headers.env.select { |key, _| key.start_with?("HTTP_") },
        params: params.to_unsafe_h,
        scoped_connection_id: params[:connection_id]
      )

      if result.preflight?
        render json: result.body, status: result.status
      else
        head result.status
      end
    rescue OrbitConnect::WebhookVerificationFailed => e
      OrbitConnect.config.logger.warn("[OrbitConnect] Webhook verification failed: #{e.message}")
      head :unauthorized
    rescue OrbitConnect::Error => e
      OrbitConnect.config.logger.error("[OrbitConnect] Webhook ingest failed: #{e.class}: #{e.message}")
      head :unprocessable_entity
    end
  end
end
