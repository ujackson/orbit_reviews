# frozen_string_literal: true

module Orbit
  class OutboundMessageSender
    class << self
      def call(conversation:, body:)
        raise OrbitConnect::ValidationError, "Reply body is required" if body.blank?

        case conversation.external_source
        when "gmail"
          send_gmail!(conversation:, body:)
        when "slack"
          send_slack!(conversation:, body:)
        else
          raise OrbitConnect::ValidationError, "Replies are not supported for #{conversation.external_source}"
        end
      end

      private

      def send_gmail!(conversation:, body:)
        connection = connection_for(conversation, "gmail")
        recipient = conversation.latest_message&.sender&.email || conversation.sender&.email
        raise OrbitConnect::ValidationError, "No recipient found for Gmail reply" if recipient.blank?

        response = connection.provider.client.send_message(
          to: recipient,
          subject: reply_subject(conversation.subject),
          body: body,
          thread_id: conversation.external_id
        )

        create_outbound_message!(
          conversation: conversation,
          connection: connection,
          external_id: response["id"] || SecureRandom.uuid,
          body: body,
          metadata: response
        )
      end

      def send_slack!(conversation:, body:)
        connection = connection_for(conversation, "slack")
        channel_id = conversation.metadata&.dig("channel_id")
        thread_ts = conversation.metadata&.dig("thread_ts")
        raise OrbitConnect::ValidationError, "No Slack channel found for reply" if channel_id.blank?

        response = connection.provider.client.post_message(
          channel_id: channel_id,
          text: body,
          thread_ts: thread_ts
        )

        create_outbound_message!(
          conversation: conversation,
          connection: connection,
          external_id: "#{response['channel'] || channel_id}:#{response['ts'] || SecureRandom.uuid}",
          body: body,
          metadata: response
        )
      end

      def connection_for(conversation, provider_key)
        connection_id = conversation.metadata&.dig("connection_id")
        scope = OrbitConnect::Connection.active.where(
          workspace_id: conversation.workspace_id,
          provider_key: provider_key
        )
        connection = connection_id.present? ? scope.find_by(id: connection_id) : scope.order(updated_at: :desc).first
        raise OrbitConnect::ValidationError, "#{provider_key.titleize} is not connected" unless connection

        connection
      end

      def create_outbound_message!(conversation:, connection:, external_id:, body:, metadata:)
        sender = Contact.find_or_create_by!(
          workspace_id: conversation.workspace_id,
          email: outbound_contact_email(connection)
        ) do |contact|
          contact.name = connection.external_name.presence || "Orbit"
        end

        Message.create!(
          conversation: conversation,
          external_id: external_id,
          external_source: connection.provider_key,
          sender: sender,
          channel: conversation.channel,
          subject: conversation.subject,
          body: body,
          preview: body.truncate(240),
          timestamp: Time.current,
          status: :read,
          direction: :outbound,
          metadata: metadata || {}
        )
      end

      def outbound_contact_email(connection)
        connection.external_name.presence || "orbit-#{connection.provider_key}-#{connection.id}@orbit.local"
      end

      def reply_subject(subject)
        subject.to_s.match?(/\ARe:/i) ? subject.to_s : "Re: #{subject}"
      end
    end
  end
end
