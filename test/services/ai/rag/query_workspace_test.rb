# frozen_string_literal: true

require "test_helper"

class AiRagQueryWorkspaceTest < ActiveSupport::TestCase
  test "queries orbit_ai with only same workspace candidates" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    AiEmbeddingRecord.create!(
      workspace:,
      content_type: "message",
      content_id: "conversation:1:chunk:1",
      title: "Roadmap",
      content: "Q4 roadmap needs board review on Thursday.",
      embedding: Array.new(1024, 0.1)
    )
    AiEmbeddingRecord.create!(
      workspace: other_workspace,
      content_type: "message",
      content_id: "conversation:2:chunk:1",
      title: "Other tenant",
      content: "Private content from another workspace.",
      embedding: Array.new(1024, 0.9)
    )
    client = FakeQueryClient.new

    result = Ai::Rag::QueryWorkspace.call(
      workspace:,
      user_id: "user_123",
      query: "When is roadmap review?",
      filters: { content_type: "message" },
      top_k: 5,
      client:
    )

    assert result[:success]
    assert_equal "The roadmap review is Thursday.", result.dig(:data, "answer")
    assert_equal [workspace.id.to_s], client.candidates.map { |candidate| candidate[:workspace_id] }.uniq
    assert_equal ["message"], client.candidates.map { |candidate| candidate[:content_type] }.uniq
  end

  test "returns empty answer when no workspace knowledge exists" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")

    result = Ai::Rag::QueryWorkspace.call(workspace:, query: "anything", client: FakeQueryClient.new)

    assert result[:success]
    assert_equal [], result.dig(:data, "sources")
  end

  test "falls back to lexical candidates when indexed knowledge has no vector yet" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    AiEmbeddingRecord.create!(
      workspace:,
      content_type: "message",
      content_id: "conversation:1:chunk:1",
      title: "Open Source Summit",
      content: "Open source maintainers will meet in Minneapolis in May.",
      metadata: { "conversation_content_id" => "conversation:1", "embedding_status" => "skipped" },
      embedding: nil
    )
    client = FakeQueryClient.new

    result = Ai::Rag::QueryWorkspace.call(
      workspace:,
      query: "What is this Open Source Summit conversation about?",
      filters: { content_type: "message", conversation_content_id: "conversation:1" },
      top_k: 3,
      client:
    )

    assert result[:success]
    assert_equal "The roadmap review is Thursday.", result.dig(:data, "answer")
    assert_equal ["conversation:1:chunk:1"], client.candidates.map { |candidate| candidate[:content_id] }
  end

  test "returns source backed fallback when answer synthesis times out" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    AiEmbeddingRecord.create!(
      workspace:,
      content_type: "message",
      content_id: "conversation:1:chunk:1",
      title: "Roadmap",
      content: "Q4 roadmap needs board review on Thursday.",
      embedding: Array.new(1024, 0.1)
    )

    result = Ai::Rag::QueryWorkspace.new(
      workspace:,
      query: "roadmap",
      client: SlowQueryClient.new,
      top_k: 1,
      synthesis_timeout: 0.01
    ).call

    assert result[:success]
    assert_match "closest indexed source", result.dig(:data, "answer")
    assert_equal 1, result.dig(:data, "sources").size
  end

  class FakeQueryClient
    attr_reader :candidates

    def create_embedding(content_type:, content_id:, text:, metadata:)
      OrbitAi::Client::Result.new(success: true, data: { "embedding" => Array.new(1024, 0.1) })
    end

    def rag_query(query:, filters:, top_k:, candidates:)
      @candidates = candidates
      OrbitAi::Client::Result.new(
        success: true,
        data: {
          "answer" => "The roadmap review is Thursday.",
          "sources" => candidates.first(1)
        }
      )
    end
  end

  class SlowQueryClient < FakeQueryClient
    def rag_query(query:, filters:, top_k:, candidates:)
      sleep 1
    end
  end
end
