require "test_helper"
require "net/http"

class AiGatewayClientTest < ActiveSupport::TestCase
  test "sends scoped headers and sanitized context body" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)
    captured_request = nil
    response = Net::HTTPOK.new("1.1", "200", "OK")
    response.instance_variable_set(:@read, true)
    response.instance_variable_set(:@body, JSON.generate(gateway_response))
    fake_http = Object.new
    fake_http.define_singleton_method(:request) do |request|
      captured_request = request
      response
    end

    with_singleton_stub(Net::HTTP, :start, implementation: ->(*, **, &block) { block.call(fake_http) }) do
      Ai::GatewayClient.new(gateway_url: "http://ai.local:8081", service_token: "secret").analyze_conversation(
        workspace:,
        conversation:,
        context: { conversation: { id: conversation.id }, messages: [{ id: 1, body: "plain text" }] }
      )
    end

    assert_equal "Bearer secret", captured_request["Authorization"]
    assert_equal workspace.id, captured_request["X-Orbit-Workspace-Id"]
    assert captured_request["X-Orbit-Request-Id"].present?

    body = JSON.parse(captured_request.body)
    assert_equal workspace.id, body["workspace_id"]
    assert_equal conversation.id, body["conversation_id"]
    assert_equal "plain text", body.dig("context", "messages", 0, "body")
  end

  test "raises gateway error on bad gateway" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)
    response = Net::HTTPBadGateway.new("1.1", "502", "Bad Gateway")
    response.instance_variable_set(:@read, true)
    response.instance_variable_set(:@body, JSON.generate(error: "provider failed"))
    fake_http = Object.new
    fake_http.define_singleton_method(:request) { |_| response }

    assert_raises(Ai::GatewayError) do
      with_singleton_stub(Net::HTTP, :start, implementation: ->(*, **, &block) { block.call(fake_http) }) do
        Ai::GatewayClient.new(gateway_url: "http://ai.local:8081", service_token: "secret").analyze_conversation(
          workspace:,
          conversation:,
          context: { conversation: { id: conversation.id } }
        )
      end
    end
  end

  private

  def gateway_response
    {
      summary: { text: "Summary", confidence: 0.86 },
      intent: { label: "request_for_information", display_label: "Request for Information", confidence: 0.82, signals: ["deadline"] },
      priority: { level: "high", confidence: 0.76, reason: "Deadline mentioned." },
      sentiment: { label: "neutral", confidence: 0.74 },
      suggested_reply: { draft: "Hi Sarah...", tone: "professional", confidence: 0.79 },
      entities: [],
      next_actions: [{ label: "Draft reply", action_type: "draft_reply", confidence: 0.8, requires_approval: true }],
      metadata: { provider: "ollama", model: "qwen2.5:7b", analysis_version: "v1" }
    }
  end
end
