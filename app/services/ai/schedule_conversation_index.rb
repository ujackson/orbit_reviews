# frozen_string_literal: true

module Ai
  class ScheduleConversationIndex
    DEBOUNCE_WINDOW = 2.minutes
    PROCESS_DEBOUNCE_CACHE = ActiveSupport::Cache::MemoryStore.new

    class << self
      def call(workspace:, conversation:, reason: "conversation_changed")
        new(workspace:, conversation:, reason:).call
      end

      def reset_process_debounce_cache!
        PROCESS_DEBOUNCE_CACHE.clear
      end
    end

    def initialize(workspace:, conversation:, reason:)
      @workspace = workspace
      @conversation = conversation
      @reason = reason
    end

    def call
      raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id
      return false unless conversation.messages.exists?

      fingerprint = Ai::ConversationFingerprint.call(workspace:, conversation:)
      return false if indexed_for_fingerprint?(fingerprint) || recently_enqueued?(fingerprint)

      mark_enqueued(fingerprint)
      Ai::RagIndexConversationJob.perform_later(workspace_id: workspace.id, conversation_id: conversation.id, reason:, fingerprint:)
      true
    end

    private

    attr_reader :workspace, :conversation, :reason

    def indexed_for_fingerprint?(fingerprint)
      AiEmbeddingRecord
        .for_workspace(workspace)
        .where(content_type: Ai::Rag::IndexConversation::CONTENT_TYPE)
        .where("metadata ->> 'conversation_content_id' = ?", conversation_content_id)
        .where("metadata ->> 'fingerprint' = ?", fingerprint)
        .exists?
    end

    def recently_enqueued?(fingerprint)
      key = cache_key(fingerprint)
      Rails.cache.exist?(key) || PROCESS_DEBOUNCE_CACHE.exist?(key)
    end

    def mark_enqueued(fingerprint)
      key = cache_key(fingerprint)
      Rails.cache.write(key, true, expires_in: DEBOUNCE_WINDOW)
      PROCESS_DEBOUNCE_CACHE.write(key, true, expires_in: DEBOUNCE_WINDOW)
    end

    def cache_key(fingerprint)
      "ai/rag_index/#{workspace.id}/#{conversation.id}/#{fingerprint}"
    end

    def conversation_content_id
      "conversation:#{conversation.id}"
    end
  end
end
