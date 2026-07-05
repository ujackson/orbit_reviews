require "test_helper"

class AiScheduleConversationIndexTest < ActiveJob::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(workspace: @workspace, external_id: "thread-index", external_source: "gmail", sender: @contact)
    @message = Message.create!(conversation: @conversation, external_id: "m1", external_source: "gmail", sender: @contact, body: "Index this", timestamp: Time.current)
    clear_enqueued_jobs
    Ai::ScheduleConversationIndex.reset_process_debounce_cache!
  end

  test "enqueues rag indexing once for the current fingerprint" do
    assert_enqueued_with(job: Ai::RagIndexConversationJob) do
      assert Ai::ScheduleConversationIndex.call(workspace: @workspace, conversation: @conversation, reason: "sync")
    end

    assert_no_enqueued_jobs only: Ai::RagIndexConversationJob do
      assert_not Ai::ScheduleConversationIndex.call(workspace: @workspace, conversation: @conversation, reason: "sync")
    end
  end

  test "does not enqueue when current fingerprint is already indexed" do
    fingerprint = Ai::ConversationFingerprint.call(workspace: @workspace, conversation: @conversation)
    AiEmbeddingRecord.create!(
      workspace: @workspace,
      content_type: "message",
      content_id: "conversation:#{@conversation.id}:chunk:0",
      content: "Index this",
      metadata: {
        "conversation_content_id" => "conversation:#{@conversation.id}",
        "fingerprint" => fingerprint
      },
      embedding: Array.new(1024, 0.1)
    )

    assert_no_enqueued_jobs only: Ai::RagIndexConversationJob do
      assert_not Ai::ScheduleConversationIndex.call(workspace: @workspace, conversation: @conversation, reason: "sync")
    end
  end

  test "message changes schedule knowledge indexing" do
    clear_enqueued_jobs

    assert_enqueued_with(job: Ai::RagIndexConversationJob) do
      @message.update!(body: "Index this updated body")
    end
  end
end
