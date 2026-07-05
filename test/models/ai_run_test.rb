require "test_helper"

class AiRunTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(workspace: @workspace, external_id: "thread-1", external_source: "gmail", sender: @contact, subject: "Help")
  end

  test "status lifecycle helpers" do
    run = AiRun.create!(workspace: @workspace, conversation: @conversation)
    assert_equal "pending", run.status

    run.start!(provider: "stub", model: "orbit-stub-v1")
    assert_equal "running", run.status
    assert_equal "stub", run.provider
    assert run.started_at.present?

    run.complete!
    assert_equal "completed", run.status
    assert run.completed_at.present?
  end

  test "failure stores compact error message" do
    run = AiRun.create!(workspace: @workspace, conversation: @conversation)
    run.fail!("boom")

    assert_equal "failed", run.status
    assert_equal "boom", run.error_message
  end
end
