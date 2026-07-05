require "test_helper"

class AiArtifactTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(workspace: @workspace, external_id: "thread-1", external_source: "gmail", sender: @contact, subject: "Help")
    @run = AiRun.create!(workspace: @workspace, conversation: @conversation)
  end

  test "validates artifact type and confidence" do
    artifact = AiArtifact.new(workspace: @workspace, conversation: @conversation, ai_run: @run, artifact_type: "summary", confidence: 0.5)
    assert artifact.valid?

    artifact.artifact_type = "workflow_action"
    assert_not artifact.valid?

    artifact.artifact_type = "summary"
    artifact.confidence = 1.2
    assert_not artifact.valid?
  end

  test "fresh scope excludes stale artifacts" do
    fresh = AiArtifact.create!(workspace: @workspace, conversation: @conversation, ai_run: @run, artifact_type: "summary", payload: { text: "Fresh" })
    AiArtifact.create!(workspace: @workspace, conversation: @conversation, ai_run: @run, artifact_type: "intent", payload: { label: "Old" }, stale: true)

    assert_equal [fresh], AiArtifact.fresh.to_a
  end

  test "blocks mismatched workspace conversation" do
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    artifact = AiArtifact.new(workspace: other_workspace, conversation: @conversation, ai_run: @run, artifact_type: "summary")

    assert_not artifact.valid?
  end
end
