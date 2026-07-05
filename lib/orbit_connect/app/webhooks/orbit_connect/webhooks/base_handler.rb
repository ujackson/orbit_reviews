require "digest"

module OrbitConnect
  module Webhooks
    class BaseHandler
      attr_reader :provider, :connection, :raw_body, :headers, :params

      def initialize(provider:, connection:, raw_body:, headers:, params:)
        @provider = provider
        @connection = connection
        @raw_body = raw_body
        @headers = headers
        @params = params
      end

      def verify!
        true
      end

      def preflight_response
        nil
      end

      def event_uid
        payload["event_id"] || Digest::SHA256.hexdigest(raw_body.to_s)
      end

      def event_type
        payload["type"] || "unknown"
      end

      def payload
        @payload ||= JSON.parse(raw_body.presence || "{}")
      rescue JSON::ParserError
        {}
      end

      def signature
        headers["HTTP_X_SIGNATURE"] || headers["HTTP_X_SLACK_SIGNATURE"]
      end

      def process!(event)
        event.update!(status: :ignored)
      end
    end
  end
end
