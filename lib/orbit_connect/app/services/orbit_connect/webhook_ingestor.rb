require "digest"

module OrbitConnect
  class WebhookIngestor
    class << self
      def ingest!(provider_key:, raw_body:, headers:, params:, scoped_connection_id: nil)
        provider_class = OrbitConnect.provider_class(provider_key)
        connection = scoped_connection_id.present? ? OrbitConnect::Connection.find(scoped_connection_id) : nil
        handler = provider_class.new(connection: connection).webhook_handler(raw_body:, headers:, params:)

        if (preflight = handler.preflight_response)
          return OrbitConnect::WebhookResult.new(status: :ok, body: preflight)
        end

        handler.verify!

        event = OrbitConnect::WebhookEvent.find_or_initialize_by(
          provider_key: provider_key.to_s,
          event_uid: handler.event_uid
        )
        event.connection ||= handler.connection
        event.event_type = handler.event_type
        event.headers = headers
        event.payload = handler.payload
        event.signature = handler.signature
        event.received_at ||= Time.current
        event.status = :received
        event.save!
        event.connection&.update!(last_webhook_at: Time.current)

        OrbitConnect::AuditLogger.log!(action: "webhook.received", provider_key:, connection: event.connection, data: { event_uid: event.event_uid, event_type: event.event_type })
        ActiveSupport::Notifications.instrument("orbit_connect.webhook.received", provider_key: provider_key.to_s, event_uid: event.event_uid)

        OrbitConnect::ProcessWebhookEventJob.perform_later(event.id)
        OrbitConnect::WebhookResult.new(status: :accepted)
      end

      def process!(event)
        provider_class = OrbitConnect.provider_class(event.provider_key)
        handler = provider_class.new(connection: event.connection).webhook_handler(
          raw_body: event.payload.to_json,
          headers: event.headers || {},
          params: {}
        )

        event.update!(status: :processing, attempt_count: event.attempt_count.to_i + 1)
        handler.process!(event)
        event.update!(status: :processed, processed_at: Time.current, last_error: nil)
      rescue => e
        event.update!(status: :failed, last_error: e.message)
        raise
      end
    end
  end
end
