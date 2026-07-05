# frozen_string_literal: true

require "net/http"
require "securerandom"

module OrbitAi
  class Client
    Result = Struct.new(:success, :data, :error, :status, keyword_init: true) do
      def success?
        success
      end
    end

    def initialize(workspace_id:, user_id:, base_url: config.base_url, secret_key: config.secret_key, timeout: config.timeout)
      @workspace_id = workspace_id.to_s
      @user_id = user_id.to_s
      @base_url = base_url.to_s.delete_suffix("/")
      @secret_key = secret_key.to_s
      @timeout = timeout.to_i
    end

    def analyze_email(email_or_hash)
      payload = normalize_email_payload(email_or_hash)
      post("/api/v1/analyze", payload)
    end

    def create_embedding(content_type:, content_id:, text:, metadata: {})
      post("/api/v1/embeddings", { content_type:, content_id:, text:, metadata: })
    end

    def rag_index(content_type:, content_id:, text:, title: nil, metadata: {})
      post("/api/v1/rag/index", { content_type:, content_id:, title:, text:, metadata: })
    end

    def rag_query(query:, filters: {}, top_k: 5, candidates: [])
      post("/api/v1/rag/query", { query:, filters:, top_k:, candidates: })
    end

    def run_workflow(workflow_type:, input:, requires_approval: true)
      post("/api/v1/workflows/run", { workflow_type:, input:, requires_approval: })
    end

    private

    attr_reader :workspace_id, :user_id, :base_url, :secret_key, :timeout

    def self.config
      Rails.application.config.x.orbit_ai
    end

    def config
      self.class.config
    end

    def post(path, payload)
      return Result.new(success: false, error: "orbit_ai is disabled") unless config.enabled

      request_id = SecureRandom.uuid
      uri = URI("#{base_url}#{path}")
      request = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request["Accept"] = "application/json"
      request["X-Orbit-Workspace-Id"] = workspace_id
      request["X-Orbit-User-Id"] = user_id
      request["X-Orbit-Request-Id"] = request_id
      add_cloudflare_access_headers(request)
      request.body = JSON.generate(payload)
      request["X-Orbit-Timestamp"] = Time.now.to_i.to_s
      request["X-Orbit-Signature"] = signature(
        timestamp: request["X-Orbit-Timestamp"],
        method: request.method,
        path: uri.path,
        body: request.body,
        request_id:
      )

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https", open_timeout: timeout, read_timeout: timeout) do |http|
        http.request(request)
      end

      parse_response(response)
    rescue Net::OpenTimeout, Net::ReadTimeout
      Result.new(success: false, error: "orbit_ai request timed out")
    rescue => e
      Result.new(success: false, error: "orbit_ai request failed: #{e.class}")
    end

    def parse_response(response)
      body = response.body.present? ? JSON.parse(response.body) : {}
      if response.is_a?(Net::HTTPSuccess)
        Result.new(success: true, data: body, status: response.code.to_i)
      else
        Result.new(success: false, error: body["detail"] || body["error"] || "orbit_ai returned HTTP #{response.code}", status: response.code.to_i)
      end
    rescue JSON::ParserError
      Result.new(success: false, error: "orbit_ai returned invalid JSON", status: response.code.to_i)
    end

    def signature(timestamp:, method:, path:, body:, request_id:)
      OrbitAi::Signature.hexdigest(secret_key:, timestamp:, method:, path:, body:, workspace_id:, user_id:, request_id:)
    end

    def add_cloudflare_access_headers(request)
      client_id = config.cf_access_client_id.to_s
      client_secret = config.cf_access_client_secret.to_s
      return if client_id.blank? || client_secret.blank?

      request["CF-Access-Client-Id"] = client_id
      request["CF-Access-Client-Secret"] = client_secret
    end

    def normalize_email_payload(email_or_hash)
      if email_or_hash.respond_to?(:attributes)
        {
          source_type: "email",
          source_id: email_or_hash.id.to_s,
          subject: email_or_hash.respond_to?(:subject) ? email_or_hash.subject : nil,
          body: email_or_hash.respond_to?(:body) ? email_or_hash.body.to_s : "",
          sender: email_or_hash.respond_to?(:sender) ? email_or_hash.sender&.email : nil,
          metadata: {
            model: email_or_hash.class.name,
            external_id: email_or_hash.respond_to?(:external_id) ? email_or_hash.external_id : nil
          }.compact
        }
      else
        email_or_hash.to_h.symbolize_keys.reverse_merge(source_type: "email", metadata: {})
      end
    end
  end
end
