require "test_helper"
require "net/http"

class OrbitAiClientTest < ActiveSupport::TestCase
  test "analyze email sends tenant headers and hmac signature" do
    captured_request = nil
    response = Net::HTTPOK.new("1.1", "200", "OK")
    response.instance_variable_set(:@read, true)
    response.instance_variable_set(:@body, JSON.generate("summary" => "Done", "priority" => "normal", "sentiment" => "neutral", "category" => "other", "action_items" => [], "suggested_reply" => "", "confidence" => 0.4))
    fake_http = Object.new
    fake_http.define_singleton_method(:request) do |request|
      captured_request = request
      response
    end

    result = with_http(fake_http) do
      OrbitAi::Client.new(workspace_id: "ws_1", user_id: "user_1", base_url: "http://ai.local", secret_key: "secret").analyze_email(
        source_id: "email_1",
        body: "Hello",
        metadata: {}
      )
    end

    assert result.success?
    assert_equal "ws_1", captured_request["X-Orbit-Workspace-Id"]
    assert_equal "user_1", captured_request["X-Orbit-User-Id"]
    assert captured_request["X-Orbit-Request-Id"].present?
    assert captured_request["X-Orbit-Timestamp"].present?
    assert_equal expected_signature(captured_request), captured_request["X-Orbit-Signature"]
    assert_equal "/api/v1/analyze", captured_request.uri.path
  end

  test "sends cloudflare access headers when configured" do
    captured_request = nil
    response = ok_response("summary" => "Done")
    fake_http = Object.new
    fake_http.define_singleton_method(:request) do |request|
      captured_request = request
      response
    end

    with_orbit_ai_access(client_id: "cf-client-id", client_secret: "cf-client-secret") do
      result = with_http(fake_http) do
        OrbitAi::Client.new(workspace_id: "ws_1", user_id: "user_1", base_url: "http://ai.local", secret_key: "secret").analyze_email(
          source_id: "email_1",
          body: "Hello",
          metadata: {}
        )
      end

      assert result.success?
    end

    assert_equal "cf-client-id", captured_request["CF-Access-Client-Id"]
    assert_equal "cf-client-secret", captured_request["CF-Access-Client-Secret"]
  end

  test "returns structured failure when orbit ai is down" do
    result = with_singleton_stub(Net::HTTP, :start, implementation: ->(*, **) { raise Errno::ECONNREFUSED }) do
      OrbitAi::Client.new(workspace_id: "ws_1", user_id: "user_1", base_url: "http://ai.local", secret_key: "secret", timeout: 1).analyze_email(
        source_id: "email_1",
        body: "Hello",
        metadata: {}
      )
    end

    assert_not result.success?
    assert_match "orbit_ai request failed", result.error
  end

  test "rag index posts document payload" do
    captured_request = nil
    response = ok_response("content_id" => "conversation:1", "chunks" => [])
    fake_http = Object.new
    fake_http.define_singleton_method(:request) do |request|
      captured_request = request
      response
    end

    result = with_http(fake_http) do
      OrbitAi::Client.new(workspace_id: "ws_1", user_id: "user_1", base_url: "http://ai.local", secret_key: "secret").rag_index(
        content_type: "message",
        content_id: "conversation:1",
        title: "Roadmap",
        text: "Need roadmap",
        metadata: { source: "test" }
      )
    end

    assert result.success?
    assert_equal "/api/v1/rag/index", captured_request.uri.path
    body = JSON.parse(captured_request.body)
    assert_equal "message", body["content_type"]
    assert_equal "Need roadmap", body["text"]
  end

  test "rag query sends candidates to orbit ai" do
    captured_request = nil
    response = ok_response("answer" => "Done", "sources" => [])
    fake_http = Object.new
    fake_http.define_singleton_method(:request) do |request|
      captured_request = request
      response
    end

    result = with_http(fake_http) do
      OrbitAi::Client.new(workspace_id: "ws_1", user_id: "user_1", base_url: "http://ai.local", secret_key: "secret").rag_query(
        query: "roadmap",
        filters: { content_type: "message" },
        top_k: 3,
        candidates: [{ workspace_id: "ws_1", content_type: "message", content_id: "chunk_1", text: "Roadmap" }]
      )
    end

    assert result.success?
    assert_equal "/api/v1/rag/query", captured_request.uri.path
    body = JSON.parse(captured_request.body)
    assert_equal 1, body["candidates"].size
    assert_equal "message", body.dig("filters", "content_type")
  end

  private

  def with_http(fake_http, &block)
    with_singleton_stub(Net::HTTP, :start, implementation: ->(*, **, &http_block) { http_block.call(fake_http) }, &block)
  end

  def ok_response(body)
    response = Net::HTTPOK.new("1.1", "200", "OK")
    response.instance_variable_set(:@read, true)
    response.instance_variable_set(:@body, JSON.generate(body))
    response
  end

  def expected_signature(request)
    OrbitAi::Signature.hexdigest(
      secret_key: "secret",
      timestamp: request["X-Orbit-Timestamp"],
      method: request.method,
      path: request.uri.path,
      body: request.body,
      workspace_id: "ws_1",
      user_id: "user_1",
      request_id: request["X-Orbit-Request-Id"]
    )
  end

  def with_orbit_ai_access(client_id:, client_secret:)
    config = Rails.application.config.x.orbit_ai
    old_client_id = config.cf_access_client_id
    old_client_secret = config.cf_access_client_secret
    config.cf_access_client_id = client_id
    config.cf_access_client_secret = client_secret
    yield
  ensure
    config.cf_access_client_id = old_client_id
    config.cf_access_client_secret = old_client_secret
  end
end
