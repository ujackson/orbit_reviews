require "test_helper"

class AiScheduleConversationAnalysisTest < ActiveJob::TestCase
  test "enqueues unless recent active run exists" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)
    Message.create!(conversation:, external_id: "m1", external_source: "gmail", sender: contact, body: "Hello", timestamp: Time.current)

    assert_enqueued_with(job: AnalyzeConversationJob) do
      assert Ai::ScheduleConversationAnalysis.call(workspace:, conversation:, reason: "gmail_sync")
    end

    AiRun.create!(workspace:, conversation:, status: :running, created_at: 1.minute.ago)

    assert_no_enqueued_jobs do
      assert_not Ai::ScheduleConversationAnalysis.call(workspace:, conversation:, reason: "gmail_sync")
    end
  end

  test "does not enqueue when fresh artifacts match current fingerprint" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-2", external_source: "gmail", sender: contact)
    Message.create!(conversation:, external_id: "m2", external_source: "gmail", sender: contact, body: "Hello", timestamp: Time.current)
    fingerprint = Ai::ConversationFingerprint.call(workspace:, conversation:)
    run = AiRun.create!(workspace:, conversation:, status: :completed, metadata: { fingerprint: })
    AiArtifact.create!(workspace:, conversation:, ai_run: run, artifact_type: "summary", payload: { text: "Done" }, metadata: { fingerprint: })

    assert_no_enqueued_jobs do
      assert_not Ai::ScheduleConversationAnalysis.call(workspace:, conversation:, reason: "gmail_sync")
    end
  end

  test "enqueues again when conversation fingerprint changes" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-3", external_source: "gmail", sender: contact)
    Message.create!(conversation:, external_id: "m3", external_source: "gmail", sender: contact, body: "Hello", timestamp: Time.current)
    fingerprint = Ai::ConversationFingerprint.call(workspace:, conversation:)
    run = AiRun.create!(workspace:, conversation:, status: :completed, metadata: { fingerprint: })
    AiArtifact.create!(workspace:, conversation:, ai_run: run, artifact_type: "summary", payload: { text: "Done" }, metadata: { fingerprint: })

    Message.create!(conversation:, external_id: "m4", external_source: "gmail", sender: contact, body: "New message", timestamp: Time.current)

    assert_enqueued_with(job: AnalyzeConversationJob) do
      assert Ai::ScheduleConversationAnalysis.call(workspace:, conversation:, reason: "gmail_sync")
    end
  end
end
