# frozen_string_literal: true

require "net/http"
require "securerandom"

module Ai
  class GatewayClient
    DEFAULT_URL = "http://localhost:8000"
    DEFAULT_TIMEOUT = 180

    class << self
      def analyze_conversation(workspace:, conversation:, context:)
        new.analyze_conversation(workspace:, conversation:, context:)
      end
    end

    def initialize(
      gateway_url: ENV.fetch("ORBIT_AI_GATEWAY_URL", DEFAULT_URL),
      service_token: ENV["ORBIT_AI_SERVICE_TOKEN"],
      timeout: ENV.fetch("ORBIT_AI_GATEWAY_TIMEOUT", DEFAULT_TIMEOUT).to_i
    )
      @gateway_url = gateway_url.to_s.delete_suffix("/")
      @service_token = service_token.presence
      @timeout = timeout
    end

    def analyze_conversation(workspace:, conversation:, context:)
      raise Ai::GatewayError, "AI gateway service token is not configured" if service_token.blank?

      uri = URI("#{gateway_url}/v1/conversations/analyze")
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{service_token}"
      request["Content-Type"] = "application/json"
      request["Accept"] = "application/json"
      request["X-Orbit-Workspace-Id"] = workspace.id.to_s
      request["X-Orbit-Request-Id"] = SecureRandom.uuid
      request.body = JSON.generate(
        workspace_id: workspace.id,
        conversation_id: conversation.id,
        analysis_version: "v1",
        context:
      )

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https", open_timeout: timeout, read_timeout: timeout) do |http|
        http.request(request)
      end

      handle_response(response)
    rescue Ai::GatewayError
      raise
    rescue JSON::ParserError => e
      raise Ai::GatewayError, "AI gateway returned invalid JSON: #{e.message}"
    rescue Net::OpenTimeout, Net::ReadTimeout
      raise Ai::GatewayError, "AI gateway request timed out"
    rescue => e
      raise Ai::GatewayError, "AI gateway request failed: #{e.class}"
    end

    private

    attr_reader :gateway_url, :service_token, :timeout

    def handle_response(response)
      case response
      when Net::HTTPSuccess
        JSON.parse(response.body)
      when Net::HTTPUnauthorized, Net::HTTPForbidden
        raise Ai::GatewayError, "AI gateway authentication failed"
      when Net::HTTPUnprocessableEntity
        raise Ai::GatewayError, "AI gateway rejected the analysis request"
      when Net::HTTPBadGateway
        raise Ai::GatewayError, "AI gateway model provider failed"
      else
        raise Ai::GatewayError, "AI gateway request failed with HTTP #{response.code}"
      end
    end
  end
end
