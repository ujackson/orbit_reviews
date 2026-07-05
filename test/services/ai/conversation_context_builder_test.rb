require "test_helper"

class AiConversationContextBuilderTest < ActiveSupport::TestCase
  test "builds scoped chronological sanitized context" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact, subject: "Roadmap", priority: :high)
    newer = Message.create!(conversation: conversation, external_id: "m2", external_source: "gmail", sender: contact, body: "<p>Need this by Thursday</p><script>bad()</script>", timestamp: 1.minute.ago)
    older = Message.create!(conversation: conversation, external_id: "m1", external_source: "gmail", sender: contact, body: "Hello", timestamp: 2.minutes.ago)

    context = Ai::ConversationContextBuilder.call(workspace:, conversation:)

    assert_equal workspace.id, context[:workspace_id]
    assert_equal "Roadmap", context.dig(:conversation, :subject)
    assert_equal [older.id, newer.id], context[:messages].map { |message| message[:id] }
    assert_includes context[:messages].last[:body], "Need this by Thursday"
    assert_not_includes context[:messages].last[:body], "<script>"
    assert_not_includes context[:messages].last[:body], "bad()"
  end

  test "decodes html entities when sanitizing message body" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-entities", external_source: "gmail", sender: contact)
    Message.create!(conversation: conversation, external_id: "m1", external_source: "gmail", sender: contact, body: "<p>Hello&nbsp;there &amp; thanks</p>")

    context = Ai::ConversationContextBuilder.call(workspace:, conversation:)

    assert_equal "Hello there & thanks", context[:messages].first[:body]
  end

  test "blocks cross workspace context" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    contact = Contact.create!(workspace: workspace, email: "sarah@example.com", name: "Sarah")
    conversation = Conversation.create!(workspace: workspace, external_id: "thread-1", external_source: "gmail", sender: contact)

    assert_raises(ActiveRecord::RecordNotFound) do
      Ai::ConversationContextBuilder.call(workspace: other_workspace, conversation:)
    end
  end
end
