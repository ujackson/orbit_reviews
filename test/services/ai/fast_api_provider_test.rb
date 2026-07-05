require "test_helper"

class AiFastApiProviderTest < ActiveSupport::TestCase
  test "normalizes gateway response into artifact writer shape" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)
    client = Class.new do
      def analyze_email(payload)
        OrbitAi::Client::Result.new(
          success: true,
          data: {
            "summary" => "Summary",
            "priority" => "high",
            "sentiment" => "neutral",
            "category" => "support",
            "intent" => {
              "label" => "support_request",
              "display_label" => "Support Request",
              "confidence" => 0.83,
              "signals" => ["deadline"]
            },
            "action_items" => ["Draft reply"],
            "suggested_reply" => "Hi Sarah...",
            "extracted_entities" => [
              { "key" => "deadline", "value" => "Thursday", "type" => "date_reference", "confidence" => 0.8 }
            ],
            "suggested_actions" => [
              { "label" => "Draft reply", "action_type" => "draft_reply", "confidence" => 0.82, "requires_approval" => true }
            ],
            "confidence" => 0.86
          }
        )
      end
    end

    result = Ai::Providers::FastApiProvider.new(client: client.new).analyze_conversation(context: { conversation: { subject: "Help" }, messages: [] }, workspace:, conversation:)

    assert_equal "Summary", result.dig("summary", "text")
    assert_equal "Support Request", result.dig("intent", "display_label")
    assert_equal "high", result.dig("priority", "level")
    assert_equal "Thursday", result.dig("entities", 0, "value")
    assert_equal "Draft reply", result.dig("next_actions", 0, "label")
    assert result.dig("next_actions", 0, "requires_approval")
  end

  test "does not create draft reply action when gateway returns no suggested reply" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-2", external_source: "gmail", sender: contact)
    client = Class.new do
      def analyze_email(payload)
        OrbitAi::Client::Result.new(
          success: true,
          data: {
            "summary" => "Newsletter summary",
            "priority" => "normal",
            "sentiment" => "neutral",
            "category" => "other",
            "action_items" => ["Draft reply to request subscription"],
            "suggested_reply" => "",
            "suggested_actions" => [
              { "label" => "Draft reply", "action_type" => "draft_reply", "confidence" => 0.9, "requires_approval" => true },
              { "label" => "Draft reply to request subscription", "action_type" => "review", "confidence" => 0.9, "requires_approval" => true }
            ],
            "confidence" => 0.9
          }
        )
      end
    end

    result = Ai::Providers::FastApiProvider.new(client: client.new).analyze_conversation(context: { conversation: { subject: "Newsletter" }, messages: [] }, workspace:, conversation:)

    assert_empty result["next_actions"]
    assert_equal "", result.dig("suggested_reply", "draft")
  end

  test "includes same workspace rag sources in gateway metadata" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-rag-analysis", external_source: "gmail", sender: contact, subject: "Roadmap")
    AiEmbeddingRecord.create!(
      workspace:,
      content_type: "message",
      content_id: "conversation:prior:0:abc",
      title: "Prior roadmap discussion",
      content: "The Q4 roadmap was approved for customer review.",
      metadata: { "conversation_id" => "prior" },
      embedding: Array.new(1024, 0.1)
    )
    AiEmbeddingRecord.create!(
      workspace: other_workspace,
      content_type: "message",
      content_id: "conversation:other:0:abc",
      title: "Other tenant",
      content: "Private tenant knowledge.",
      metadata: { "conversation_id" => "other" },
      embedding: Array.new(1024, 0.1)
    )
    client = CapturingClient.new

    Ai::Providers::FastApiProvider.new(client:).analyze_conversation(
      context: { conversation: { subject: "Roadmap" }, messages: [{ body: "What is approved?" }] },
      workspace:,
      conversation:
    )

    rag_sources = client.payload.dig(:metadata, :rag_sources)
    assert_equal 1, rag_sources.size
    assert_equal "conversation:prior:0:abc", rag_sources.first[:content_id]
    assert_not_includes rag_sources.map { |source| source[:content_id] }, "conversation:other:0:abc"
  end

  class CapturingClient
    attr_reader :payload

    def create_embedding(content_type:, content_id:, text:, metadata:)
      OrbitAi::Client::Result.new(success: true, data: { "embedding" => Array.new(1024, 0.1) })
    end

    def analyze_email(payload)
      @payload = payload
      OrbitAi::Client::Result.new(
        success: true,
        data: {
          "summary" => "Summary",
          "priority" => "normal",
          "sentiment" => "neutral",
          "category" => "other",
          "action_items" => [],
          "suggested_reply" => "",
          "confidence" => 0.8
        }
      )
    end
  end
end
