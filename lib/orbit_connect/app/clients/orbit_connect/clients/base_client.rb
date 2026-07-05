module OrbitConnect
  module Clients
    class BaseClient
      attr_reader :connection, :provider

      def initialize(connection:, provider:)
        @connection = connection
        @provider = provider
      end

      def get(path, params: nil, headers: {})
        request(:get, path, params:, headers:)
      end

      def post(path, body: nil, headers: {})
        request(:post, path, body:, headers:)
      end

      def request(method, path, params: nil, body: nil, headers: {}, retry_on_auth: true)
        response = faraday.public_send(method, path) do |req|
          req.headers["User-Agent"] = OrbitConnect.config.user_agent
          req.headers["Content-Type"] = "application/json" if body.present?
          apply_auth!(req)
          headers.each { |key, value| req.headers[key] = value }
          req.params.update(params) if params.present?
          req.body = body.is_a?(String) ? body : body.to_json if body.present?
        end

        handle_response(response)
      rescue OrbitConnect::Unauthorized
        if retry_on_auth && connection&.credential&.refresh_token.present?
          OrbitConnect::TokenManager.refresh!(connection)
          request(method, path, params:, body:, headers:, retry_on_auth: false)
        else
          raise
        end
      end

      def test_connection!
        raise NotImplementedError
      end

      private

      def faraday
        @faraday ||= Faraday.new(url: base_url) do |f|
          f.request :retry,
                    max: 3,
                    interval: 0.5,
                    interval_randomness: 0.25,
                    backoff_factor: 2,
                    methods: %i[get post put patch delete],
                    retry_statuses: [429, 500, 502, 503, 504]
          f.adapter Faraday.default_adapter
          f.options.timeout = OrbitConnect.config.request_timeout
          f.options.open_timeout = OrbitConnect.config.open_timeout
        end
      end

      def base_url
        raise NotImplementedError
      end

      def apply_auth!(request)
        credential = connection&.credential
        return unless credential

        case credential.credential_type
        when "oauth2"
          request.headers["Authorization"] = "Bearer #{credential.access_token}"
        when "api_key"
          header = connection.settings.fetch("api_key_header", "Authorization")
          prefix = connection.settings.fetch("api_key_prefix", "Bearer")
          request.headers[header] = [prefix, credential.api_key].compact.join(" ").strip
        when "basic_auth"
          username = credential.secret
          password = credential.password
          token = Base64.strict_encode64("#{username}:#{password}")
          request.headers["Authorization"] = "Basic #{token}"
        end
      end

      def handle_response(response)
        body = parse_body(response)

        case response.status
        when 200..299
          body
        when 401
          raise OrbitConnect::Unauthorized, "Unauthorized response from #{base_url}"
        when 403
          raise OrbitConnect::Forbidden, "Forbidden response from #{base_url}"
        when 429
          reset_at = response.headers["retry-after"]&.to_i&.seconds&.from_now
          raise OrbitConnect::RateLimited.new("Rate limited by #{base_url}", reset_at:)
        else
          raise OrbitConnect::Error, "HTTP #{response.status}: #{body.inspect}"
        end
      end

      def parse_body(response)
        content_type = response.headers["content-type"].to_s
        return {} if response.body.blank?
        return response.body if response.body.is_a?(Hash) || response.body.is_a?(Array)

        if content_type.include?("json")
          JSON.parse(response.body)
        else
          response.body
        end
      rescue JSON::ParserError
        response.body
      end
    end
  end
end
