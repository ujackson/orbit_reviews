require "test_helper"

class AnalyzeConversationJobTest < ActiveJob::TestCase
  test "creates completed run and artifacts" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact, subject: "Help")
    Message.create!(conversation: conversation, external_id: "m1", external_source: "gmail", sender: contact, body: "Need this by Thursday", timestamp: Time.current)
    clear_enqueued_jobs
    Ai::ScheduleConversationIndex.reset_process_debounce_cache!

    assert_difference "AiRun.completed.count", 1 do
      assert_difference "AiArtifact.count", 7 do
        assert_enqueued_with(job: Ai::RagIndexConversationJob) do
          AnalyzeConversationJob.perform_now(workspace_id: workspace.id, conversation_id: conversation.id, reason: "test")
        end
      end
    end
  end

  test "stores artifacts from mocked fast api gateway response" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-2", external_source: "gmail", sender: contact, subject: "Help")
    Message.create!(conversation: conversation, external_id: "m2", external_source: "gmail", sender: contact, body: "Need this by Thursday", timestamp: Time.current)

    with_env("ORBIT_AI_PROVIDER" => "fast_api") do
      with_orbit_ai_client(analysis_result) do
        assert_difference "AiRun.completed.count", 1 do
          assert_difference "AiArtifact.count", 7 do
            AnalyzeConversationJob.perform_now(workspace_id: workspace.id, conversation_id: conversation.id, reason: "test")
          end
        end
      end
    end

    assert_equal "fast_api", AiRun.last.provider
  end

  test "skips duplicate completed analysis for the same fingerprint" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-dup", external_source: "gmail", sender: contact, subject: "Help")
    Message.create!(conversation: conversation, external_id: "mdup", external_source: "gmail", sender: contact, body: "Already analyzed", timestamp: Time.current)
    fingerprint = Ai::ConversationFingerprint.call(workspace:, conversation:)
    run = AiRun.create!(workspace:, conversation:, status: :completed, metadata: { fingerprint: })
    AiArtifact.create!(workspace:, conversation:, ai_run: run, artifact_type: "summary", payload: { text: "Done" }, metadata: { fingerprint: })

    assert_no_difference "AiRun.count" do
      AnalyzeConversationJob.perform_now(workspace_id: workspace.id, conversation_id: conversation.id, reason: "test", fingerprint:)
    end
  end

  test "failed gateway marks run failed with safe error" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-3", external_source: "gmail", sender: contact, subject: "Help")
    Message.create!(conversation: conversation, external_id: "m3", external_source: "gmail", sender: contact, body: "Private body", timestamp: Time.current)

    with_env("ORBIT_AI_PROVIDER" => "fast_api") do
      with_orbit_ai_client(OrbitAi::Client::Result.new(success: false, error: "AI gateway model provider failed")) do
        assert_raises(Ai::GatewayError) do
          AnalyzeConversationJob.perform_now(workspace_id: workspace.id, conversation_id: conversation.id, reason: "test")
        end
      end
    end

    run = AiRun.for_conversation(workspace:, conversation:).last
    assert_equal "failed", run.status
    assert_equal "AI gateway model provider failed", run.error_message
  end

  private

  def with_env(values)
    previous = values.keys.index_with { |key| ENV[key] }
    values.each { |key, value| ENV[key] = value }
    yield
  ensure
    previous.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
  end

  def with_orbit_ai_client(result)
    fake_client = Class.new do
      define_method(:initialize) { |**| }
      define_method(:analyze_email) { |_| result }
    end
    old = OrbitAi.const_get(:Client)
    OrbitAi.send(:remove_const, :Client)
    OrbitAi.const_set(:Client, fake_client)
    yield
  ensure
    OrbitAi.send(:remove_const, :Client)
    OrbitAi.const_set(:Client, old)
  end

  def analysis_result
    OrbitAi::Client::Result.new(
      success: true,
      data: {
        "summary" => "Summary",
        "priority" => "high",
        "sentiment" => "neutral",
        "category" => "support",
        "action_items" => ["Draft reply"],
        "suggested_reply" => "Hi Sarah...",
        "confidence" => 0.86
      }
    )
  end
end
