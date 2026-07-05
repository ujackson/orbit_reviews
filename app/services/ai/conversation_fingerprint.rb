# frozen_string_literal: true

require "digest"

module Ai
  class ConversationFingerprint
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

      Digest::SHA256.hexdigest(JSON.generate(payload))
    end

    private

    attr_reader :workspace, :conversation

    def payload
      {
        conversation: {
          id: conversation.id,
          updated_at: conversation.updated_at&.utc&.iso8601(6),
          subject: conversation.subject,
          status: conversation.status,
          priority: conversation.priority,
          last_message_at: conversation.last_message_at&.utc&.iso8601(6),
          message_count: conversation.messages.count
        },
        messages: conversation.messages.order(:id).pluck(:id, :updated_at).map do |id, updated_at|
          [id, updated_at&.utc&.iso8601(6)]
        end
      }
    end
  end
end
