# frozen_string_literal: true

module Orbit
  class IntegrationIngestor
    class << self
      def call(envelope:, connection:)
        case envelope[:provider_key].to_s
        when "slack"
          persist_slack_message!(envelope:, connection:)
        else
          envelope
        end
      end

      private

      def persist_slack_message!(envelope:, connection:)
        payload = (envelope[:payload] || {}).with_indifferent_access
        workspace = connection.workspace
        channel_id = payload[:channel_id].presence || "unknown"
        message_ts = payload[:ts].presence || envelope[:external_id].to_s
        thread_ts = payload[:thread_ts].presence || message_ts
        conversation_external_id = "#{channel_id}:#{thread_ts}"
        text = payload[:text].to_s
        user_id = payload[:user].presence || "unknown"

        contact = Contact.find_or_create_by!(
          workspace_id: workspace.id,
          email: "slack-#{user_id}@slack.local"
        ) do |record|
          record.external_id = user_id
          record.name = user_id
        end

        conversation = Conversation.find_or_initialize_by(
          workspace_id: workspace.id,
          external_source: "slack",
          external_id: conversation_external_id
        )
        conversation.assign_attributes(
          channel: :slack,
          sender: conversation.sender || contact,
          subject: "Slack ##{channel_id}",
          preview: text.truncate(240),
          status: :unread,
          last_message_at: slack_time(message_ts),
          metadata: (conversation.metadata || {}).merge(
            "channel_id" => channel_id,
            "thread_ts" => thread_ts,
            "connection_id" => connection.id
          )
        )
        conversation.save!

        message = Message.find_or_initialize_by(
          conversation_id: conversation.id,
          external_id: "#{channel_id}:#{message_ts}"
        )
        message.assign_attributes(
          external_source: "slack",
          sender: contact,
          channel: :slack,
          subject: conversation.subject,
          body: text,
          preview: text.truncate(240),
          timestamp: slack_time(message_ts),
          status: :unread,
          direction: :inbound,
          metadata: (message.metadata || {}).merge(
            "channel_id" => channel_id,
            "thread_ts" => thread_ts,
            "user_id" => user_id
          )
        )
        message.save!

        conversation.reload_unread_count
        message
      end

      def slack_time(ts)
        Time.at(ts.to_s.split(".").first.to_i)
      rescue
        Time.current
      end
    end
  end
end
