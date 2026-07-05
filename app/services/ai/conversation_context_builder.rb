# frozen_string_literal: true

require "cgi"

module Ai
  class ConversationContextBuilder
    MESSAGE_LIMIT = 30
    BODY_LIMIT = 900

    class << self
      def call(workspace:, conversation:)
        new(workspace:, conversation:).call
      end
    end

    def initialize(workspace:, conversation:)
      @workspace = workspace
      @conversation = conversation
    end

    def call
      raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id

      {
        workspace_id: workspace.id,
        conversation: conversation_metadata,
        contact: contact_metadata,
        messages: messages,
        attachments: attachments,
        generated_at: Time.current.iso8601
      }
    end

    private

    attr_reader :workspace, :conversation

    def conversation_metadata
      {
        id: conversation.id,
        subject: conversation.subject,
        title: conversation.subject,
        channel: conversation.channel,
        status: conversation.status,
        priority: conversation.priority,
        assignee: metadata_value("assignee"),
        preview: conversation.preview,
        labels: conversation.labels
      }
    end

    def contact_metadata
      contact = conversation.sender || conversation.latest_message&.sender
      return {} if contact.blank?

      {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.respond_to?(:phone) ? contact.phone : nil,
        organization: contact.organization
      }.compact
    end

    def messages
      recent_messages.map do |message|
        {
          id: message.id,
          direction: message.direction,
          channel: message.channel,
          subject: message.subject,
          body: normalize_body(message.body),
          preview: message.preview,
          sent_at: (message.timestamp || message.created_at)&.iso8601,
          timestamp: (message.timestamp || message.created_at)&.iso8601,
          sender: sender_display(message.sender),
          sender_contact: sender_metadata(message.sender),
          attachments: attachment_metadata(message)
        }
      end
    end

    def attachments
      recent_messages.flat_map { |message| attachment_metadata(message) }
    end

    def recent_messages
      conversation.messages
        .includes(:sender, :attachments)
        .order(Arel.sql("COALESCE(messages.timestamp, messages.created_at) DESC"))
        .limit(MESSAGE_LIMIT)
        .to_a
        .sort_by { |message| message.timestamp || message.created_at || Time.zone.at(0) }
    end

    def sender_metadata(sender)
      return {} if sender.blank?

      {
        id: sender.id,
        name: sender.name,
        email: sender.email
      }.compact
    end

    def sender_display(sender)
      sender&.name.presence || sender&.email
    end

    def attachment_metadata(message)
      message.attachments.map do |attachment|
        {
          id: attachment.id,
          filename: attachment.filename,
          content_type: attachment.mime_type,
          byte_size: attachment.size,
          processing_status: attachment.respond_to?(:metadata) ? attachment.metadata&.dig("processing_status") || "metadata_only" : "metadata_only"
        }
      end
    end

    def normalize_body(body)
      text = body.to_s
      text = text.gsub(%r{<script\b[^>]*>.*?</script>}im, " ")
      text = text.gsub(%r{<style\b[^>]*>.*?</style>}im, " ")
      text = ActionView::Base.full_sanitizer.sanitize(text)
      text = text.gsub(/&nbsp;/i, " ")
      text = CGI.unescapeHTML(text)
      text = text.tr("\u00A0", " ")
      text = text.gsub(/[\u200B-\u200F\u202A-\u202E\u2060\u034F\u00AD]/, " ")
      text = text.gsub(/\s+/, " ").strip
      text.truncate(BODY_LIMIT, omission: "...")
    end

    def metadata_value(key)
      conversation.metadata.to_h[key]
    end
  end
end
