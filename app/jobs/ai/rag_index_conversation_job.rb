# frozen_string_literal: true

module Ai
  class RagIndexConversationJob < ApplicationJob
    queue_as :default

    def perform(workspace_id:, conversation_id:, user_id: nil, reason: "scheduled", fingerprint: nil)
      workspace = Workspace.find(workspace_id)
      conversation = workspace.conversations.find(conversation_id)
      Ai::Rag::IndexConversation.call(workspace:, conversation:, user_id:, reason:, fingerprint:)
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.warn("Ai::RagIndexConversationJob skipped: #{e.message}")
    end
  end
end
