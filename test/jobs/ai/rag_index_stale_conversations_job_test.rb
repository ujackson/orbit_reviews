# frozen_string_literal: true

require "test_helper"

class AiRagIndexStaleConversationsJobTest < ActiveJob::TestCase
  setup do
    @original_cache = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    clear_enqueued_jobs
    Rails.cache.clear
  end

  teardown do
    Rails.cache = @original_cache
  end

  test "enqueues conversations that have not been indexed" do
    conversation = create_conversation_with_message("thread-rag-missing")

    assert_enqueued_jobs 1, only: Ai::RagIndexConversationJob do
      assert_equal 1, Ai::RagIndexStaleConversationsJob.perform_now(limit: 10)
    end

    job = enqueued_jobs.last
    assert_equal conversation.workspace_id, job[:args].first["workspace_id"]
    assert_equal conversation.id, job[:args].first["conversation_id"]
  end

  test "skips conversations with fresh indexed chunks" do
    conversation = create_conversation_with_message("thread-rag-fresh")
    create_embedding_for(conversation)

    assert_no_enqueued_jobs only: Ai::RagIndexConversationJob do
      assert_equal 0, Ai::RagIndexStaleConversationsJob.perform_now(limit: 10)
    end
  end

  test "enqueues conversations changed after their last indexed chunk" do
    conversation = create_conversation_with_message("thread-rag-stale")
    create_embedding_for(conversation, updated_at: 10.minutes.ago)

    assert_enqueued_jobs 1, only: Ai::RagIndexConversationJob do
      assert_equal 1, Ai::RagIndexStaleConversationsJob.perform_now(limit: 10)
    end
  end

  test "does not enqueue the same conversation repeatedly while pending" do
    create_conversation_with_message("thread-rag-pending")

    assert_enqueued_jobs 1, only: Ai::RagIndexConversationJob do
      assert_equal 1, Ai::RagIndexStaleConversationsJob.perform_now(limit: 10)
      assert_equal 0, Ai::RagIndexStaleConversationsJob.perform_now(limit: 10)
    end
  end

  private

  def create_conversation_with_message(external_id)
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace:, email: "#{external_id}@example.com", name: "Sender")
    conversation = Conversation.create!(
      workspace:,
      external_id:,
      external_source: "gmail",
      sender: contact,
      subject: "Roadmap",
      last_message_at: Time.current
    )
    Message.create!(
      conversation:,
      external_id: "#{external_id}-message",
      external_source: "gmail",
      sender: contact,
      body: "Can you send the latest roadmap?",
      timestamp: Time.current
    )
    conversation
  end

  def create_embedding_for(conversation, updated_at: Time.current)
    record = AiEmbeddingRecord.create!(
      workspace: conversation.workspace,
      content_type: "message",
      content_id: "conversation:#{conversation.id}:chunk:1",
      content: "Latest roadmap",
      metadata: { "conversation_content_id" => "conversation:#{conversation.id}" },
      embedding: Array.new(1024, 0.1)
    )
    record.update_columns(updated_at:) if updated_at
    record
  end
end
