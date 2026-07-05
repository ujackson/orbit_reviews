# frozen_string_literal: true

module Ai
  class RagIndexStaleConversationsJob < ApplicationJob
    queue_as :default

    DEFAULT_LIMIT = 100
    MAX_LIMIT = 500
    ENQUEUE_TTL = 4.minutes

    def perform(options = {})
      options = options.to_h.symbolize_keys
      limit = options.fetch(:limit, DEFAULT_LIMIT).to_i.clamp(1, MAX_LIMIT)

      enqueued = 0

      candidate_conversations(limit:).each do |conversation|
        next unless stale?(conversation)
        next if recently_enqueued?(conversation)

        mark_enqueued(conversation)
        Ai::RagIndexConversationJob.perform_later(
          workspace_id: conversation.workspace_id,
          conversation_id: conversation.id
        )
        enqueued += 1
      end

      enqueued
    end

    private

    def candidate_conversations(limit:)
      Conversation
        .where("EXISTS (SELECT 1 FROM messages WHERE messages.conversation_id = conversations.id)")
        .order(Arel.sql("COALESCE(conversations.last_message_at, conversations.updated_at) DESC"))
        .limit(limit)
    end

    def stale?(conversation)
      indexed_at = last_indexed_at(conversation)
      return true if indexed_at.blank?

      latest_content_at(conversation) > indexed_at
    end

    def latest_content_at(conversation)
      [
        conversation.last_message_at,
        conversation.messages.maximum(:updated_at),
        conversation.updated_at
      ].compact.max
    end

    def last_indexed_at(conversation)
      AiEmbeddingRecord
        .where(workspace_id: conversation.workspace_id, content_type: "message")
        .where("metadata ->> 'conversation_content_id' = ?", conversation_content_id(conversation))
        .maximum(:updated_at)
    end

    def recently_enqueued?(conversation)
      Rails.cache.exist?(cache_key(conversation))
    end

    def mark_enqueued(conversation)
      Rails.cache.write(cache_key(conversation), true, expires_in: ENQUEUE_TTL)
    end

    def cache_key(conversation)
      "ai/rag_index_stale_conversations/#{conversation.id}"
    end

    def conversation_content_id(conversation)
      "conversation:#{conversation.id}"
    end
  end
end
