require "test_helper"

class OrbitIntegrationIngestorTest < ActiveJob::TestCase
  test "persists Slack chat message into inbox tables idempotently" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    connection = OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "slack",
      external_account_id: "T123",
      status: "connected"
    )
    envelope = {
      provider_key: "slack",
      connection_id: connection.id,
      workspace_id: workspace.id,
      resource_type: "chat_message",
      external_id: "C123:1710000000.000100",
      payload: {
        channel_id: "C123",
        thread_ts: "1710000000.000100",
        text: "hello from slack",
        user: "U123",
        ts: "1710000000.000100"
      },
      observed_at: Time.current.iso8601
    }

    assert_enqueued_jobs 1, only: Ai::RagIndexConversationJob do
      assert_difference "Conversation.count", 1 do
        assert_difference "Message.count", 1 do
          2.times { Orbit::IntegrationIngestor.call(envelope: envelope, connection: connection) }
        end
      end
    end

    conversation = workspace.conversations.find_by!(external_source: "slack", external_id: "C123:1710000000.000100")
    assert_equal "Slack #C123", conversation.subject
    assert_equal "C123", conversation.metadata["channel_id"]
    assert_equal "slack", conversation.channel

    message = conversation.messages.find_by!(external_id: "C123:1710000000.000100")
    assert_equal "hello from slack", message.body
    assert_equal "inbound", message.direction
  end
end
