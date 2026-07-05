require "openssl"

module OrbitConnect
  module Webhooks
    class SlackHandler < BaseHandler
      def preflight_response
        payload["challenge"].present? ? { challenge: payload["challenge"] } : nil
      end

      def verify!
        secret = provider.provider_app&.webhook_secret || connection&.provider_app&.webhook_secret
        raise OrbitConnect::WebhookVerificationFailed, "Slack signing secret is not configured" if secret.blank?

        timestamp = headers["HTTP_X_SLACK_REQUEST_TIMESTAMP"].to_s
        signature = headers["HTTP_X_SLACK_SIGNATURE"].to_s
        base_string = "v0:#{timestamp}:#{raw_body}"
        expected = "v0=" + OpenSSL::HMAC.hexdigest("SHA256", secret, base_string)

        unless ActiveSupport::SecurityUtils.secure_compare(expected, signature)
          raise OrbitConnect::WebhookVerificationFailed, "Slack signature mismatch"
        end
      end

      def connection
        super || connection_from_payload
      end

      def event_uid
        payload["event_id"] || payload.dig("event", "event_ts") || super
      end

      def event_type
        payload.dig("event", "type") || payload["type"] || "slack.unknown"
      end

      def process!(event)
        if payload["type"] == "url_verification"
          event.update!(status: :ignored)
          return
        end

        locate_connection_from_payload!(event)

        if event.connection.present? && payload.dig("event", "type") == "message"
          slack_event = payload["event"]
          Orbit::IntegrationIngestor.call(
            envelope: {
              provider_key: "slack",
              connection_id: event.connection.id,
              workspace_id: event.connection.workspace_id,
              resource_type: "chat_message",
              external_id: "#{slack_event['channel']}:#{slack_event['ts']}",
              payload: {
                channel_id: slack_event["channel"],
                thread_ts: slack_event["thread_ts"],
                text: slack_event["text"],
                user: slack_event["user"],
                ts: slack_event["ts"]
              },
              observed_at: Time.current.iso8601
            },
            connection: event.connection
          )
        end
      end

      private

      def locate_connection_from_payload!(event)
        return if event.connection.present?

        event.update!(connection: connection) if connection
      end

      def connection_from_payload
        @connection_from_payload ||= begin
          team_id = payload["team_id"] || payload.dig("authorizations", 0, "team_id")
          if team_id.present?
            OrbitConnect::Connection.where(
              provider_key: "slack",
              external_account_id: team_id
            ).order(created_at: :desc).first
          end
        end
      end
    end
  end
end
