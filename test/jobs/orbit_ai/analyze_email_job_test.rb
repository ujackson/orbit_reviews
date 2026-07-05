require "test_helper"

class OrbitAiAnalyzeEmailJobTest < ActiveJob::TestCase
  test "loads message scoped by workspace and calls orbit ai" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sender@example.com", name: "Sender")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)
    message = Message.create!(conversation: conversation, external_id: "message-1", external_source: "gmail", sender: contact, body: "Please help", timestamp: Time.current)
    calls = []
    fake_client = Class.new do
      define_method(:initialize) { |**kwargs| calls << kwargs }
      define_method(:analyze_email) do |record|
        calls << { message_id: record.id }
        result = Object.new
        result.define_singleton_method(:success?) { true }
        result.define_singleton_method(:data) { { "summary" => "ok" } }
        result
      end
    end

    with_const("OrbitAi::Client", fake_client) do
      OrbitAi::AnalyzeEmailJob.perform_now(message_id: message.id, workspace_id: workspace.id, user_id: "user_1")
    end

    assert_equal workspace.id, calls.first[:workspace_id]
    assert_equal "user_1", calls.first[:user_id]
    assert_equal message.id, calls.second[:message_id]
  end

  private

  def with_const(name, value)
    parent_name, const_name = name.split("::", 2)
    parent = parent_name.constantize
    old = parent.const_get(const_name)
    parent.send(:remove_const, const_name)
    parent.const_set(const_name, value)
    yield
  ensure
    parent.send(:remove_const, const_name)
    parent.const_set(const_name, old)
  end
end
