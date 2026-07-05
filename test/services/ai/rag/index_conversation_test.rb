# frozen_string_literal: true

require "test_helper"

class AiRagIndexConversationTest < ActiveSupport::TestCase
  test "indexes sanitized conversation chunks into workspace embeddings" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace:, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace:, external_id: "thread-rag", external_source: "gmail", sender: contact, subject: "Roadmap")
    Message.create!(
      conversation:,
      external_id: "msg-rag-1",
      external_source: "gmail",
      sender: contact,
      body: "<p>Can you send the Q4 roadmap by Thursday?</p><script>bad()</script>",
      timestamp: Time.current
    )
    client = FakeRagClient.new

    assert_difference "AiEmbeddingRecord.for_workspace(workspace).count", 1 do
      result = Ai::Rag::IndexConversation.call(workspace:, conversation:, user_id: "user_123", client:)

      assert_equal 1, result[:indexed_count]
    end

    record = AiEmbeddingRecord.for_workspace(workspace).last
    assert_equal "message", record.content_type
    assert_equal "conversation:#{conversation.id}:chunk:1", record.content_id
    assert_includes record.content, "Q4 roadmap"
    assert_not_includes client.indexed_text, "<script>"
    assert_equal "user_123", record.user_id
    assert_equal conversation.id, record.metadata["conversation_id"]
  end

  test "blocks cross workspace indexing" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace:, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace:, external_id: "thread-rag-cross", external_source: "gmail", sender: contact)

    assert_raises(ActiveRecord::RecordNotFound) do
      Ai::Rag::IndexConversation.call(workspace: other_workspace, conversation:, client: FakeRagClient.new)
    end
  end

  test "removes stale chunks for the same conversation" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace:, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace:, external_id: "thread-rag-stale", external_source: "gmail", sender: contact, subject: "Roadmap")
    Message.create!(conversation:, external_id: "msg-rag-stale", external_source: "gmail", sender: contact, body: "Fresh roadmap details", timestamp: Time.current)
    AiEmbeddingRecord.create!(
      workspace:,
      content_type: "message",
      content_id: "old-chunk",
      content: "Old roadmap details",
      metadata: { "conversation_content_id" => "conversation:#{conversation.id}" },
      embedding: Array.new(1024, 0.2)
    )

    Ai::Rag::IndexConversation.call(workspace:, conversation:, client: FakeRagClient.new)

    assert_not AiEmbeddingRecord.for_workspace(workspace).exists?(content_id: "old-chunk")
  end

  test "stores chunks for lexical search when embedding is skipped" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace:, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace:, external_id: "thread-rag-lexical", external_source: "gmail", sender: contact, subject: "Roadmap")
    Message.create!(conversation:, external_id: "msg-rag-lexical", external_source: "gmail", sender: contact, body: "Fresh roadmap details", timestamp: Time.current)

    result = Ai::Rag::IndexConversation.call(workspace:, conversation:, client: SkippedEmbeddingRagClient.new)

    assert_equal 1, result[:indexed_count]
    record = AiEmbeddingRecord.for_workspace(workspace).find_by!(content_id: "conversation:#{conversation.id}:chunk:1")
    assert_nil record.embedding
    assert_equal "skipped", record.metadata["embedding_status"]
    assert_includes record.content, "Fresh roadmap"
  end

  class FakeRagClient
    attr_reader :indexed_text

    def rag_index(content_type:, content_id:, text:, title:, metadata:)
      @indexed_text = text
      OrbitAi::Client::Result.new(
        success: true,
        data: {
          "content_id" => content_id,
          "chunks" => [
            {
              "chunk_id" => "#{content_id}:chunk:1",
              "content_type" => content_type,
              "content_id" => content_id,
              "title" => title,
              "text" => text,
              "metadata" => metadata
            }
          ]
        }
      )
    end

    def create_embedding(content_type:, content_id:, text:, metadata:)
      OrbitAi::Client::Result.new(
        success: true,
        data: {
          "content_id" => content_id,
          "embedding_dimensions" => 1024,
          "embedding" => Array.new(1024, 0.1),
          "status" => "embedded"
        }
      )
    end
  end

  class SkippedEmbeddingRagClient < FakeRagClient
    def create_embedding(content_type:, content_id:, text:, metadata:)
      OrbitAi::Client::Result.new(
        success: true,
        data: {
          "content_id" => content_id,
          "embedding_dimensions" => 0,
          "embedding" => [],
          "status" => "skipped"
        }
      )
    end
  end
end
