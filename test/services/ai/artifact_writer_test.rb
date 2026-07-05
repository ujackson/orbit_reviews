require "test_helper"

class AiArtifactWriterTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(workspace: @workspace, external_id: "thread-1", external_source: "gmail", sender: @contact)
    @old_run = AiRun.create!(workspace: @workspace, conversation: @conversation, status: :completed)
    @run = AiRun.create!(workspace: @workspace, conversation: @conversation, status: :running)
    @old_summary = AiArtifact.create!(workspace: @workspace, conversation: @conversation, ai_run: @old_run, artifact_type: "summary", payload: { text: "Old", confidence: 0.3 })
  end

  test "marks old artifacts stale and writes one row per top level section" do
    analysis = Ai::Providers::StubProvider.new.analyze_conversation(context: { conversation: { subject: "Help" }, contact: {}, messages: [] })

    assert_difference "AiArtifact.count", 7 do
      Ai::ArtifactWriter.call(workspace: @workspace, conversation: @conversation, ai_run: @run, analysis:, provider: "stub", model: "orbit-stub-v1")
    end

    assert @old_summary.reload.stale?
    assert_equal AiArtifact::ARTIFACT_TYPES.sort, AiArtifact.where(ai_run: @run).pluck(:artifact_type).sort
  end
end
