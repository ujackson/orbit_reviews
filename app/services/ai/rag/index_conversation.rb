# frozen_string_literal: true

module Ai
  module Rag
    class IndexConversation
      CONTENT_TYPE = "message"

      class << self
        def call(workspace:, conversation:, user_id: nil, reason: "manual", fingerprint: nil, client: nil)
          new(workspace:, conversation:, user_id:, reason:, fingerprint:, client:).call
        end
      end

      def initialize(workspace:, conversation:, user_id: nil, reason:, fingerprint:, client: nil)
        @workspace = workspace
        @conversation = conversation
        @user_id = user_id
        @reason = reason
        @fingerprint = fingerprint
        @client = client || OrbitAi::Client.new(workspace_id: workspace.id, user_id: user_id || "system")
      end

      def call
        raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id

        context = Ai::ConversationContextBuilder.call(workspace:, conversation:)
        document_text = build_document_text(context)
        return { indexed_count: 0, skipped: true, reason: "empty_context" } if document_text.blank?

        index_result = client.rag_index(
          content_type: CONTENT_TYPE,
          content_id: conversation_content_id,
          title: context.dig(:conversation, :subject),
          text: document_text,
          metadata: index_metadata(context)
        )
        return failure(index_result) unless index_result.success?

        chunks = Array(index_result.data["chunks"])
        stored_chunk_ids = []
        embedded_count = 0
        embedding_failed_count = 0
        indexed_count = chunks.sum do |chunk|
          stored = embed_and_store_chunk(chunk)
          stored_chunk_ids << stored.content_id if stored
          embedded_count += 1 if stored&.embedding.present?
          embedding_failed_count += 1 if stored && stored.embedding.blank?
          stored ? 1 : 0
        end
        delete_stale_chunks!(stored_chunk_ids)

        {
          indexed_count:,
          embedded_count:,
          embedding_failed_count:,
          chunk_count: chunks.size,
          conversation_id: conversation.id,
          content_id: conversation_content_id
        }
      end

      private

      attr_reader :workspace, :conversation, :user_id, :reason, :fingerprint, :client

      def build_document_text(context)
        header = [
          "Subject: #{context.dig(:conversation, :subject)}",
          "Channel: #{context.dig(:conversation, :channel)}",
          "Status: #{context.dig(:conversation, :status)}",
          contact_line(context[:contact])
        ].compact_blank.join("\n")

        message_text = Array(context[:messages]).map do |message|
          body = message[:body].to_s.strip
          next if body.blank?

          [
            "Message #{message[:id]}",
            "Direction: #{message[:direction]}",
            "Sender: #{message[:sender]}",
            "Sent at: #{message[:sent_at]}",
            body
          ].compact_blank.join("\n")
        end.compact.join("\n\n")

        [header, message_text].compact_blank.join("\n\n")
      end

      def contact_line(contact)
        return if contact.blank?

        values = [contact[:name], contact[:email], contact[:organization]].compact_blank.join(" / ")
        "Contact: #{values}" if values.present?
      end

      def index_metadata(context)
        {
          source: "conversation",
          conversation_id: conversation.id,
          conversation_external_id: conversation.external_id,
          workspace_id: workspace.id,
          fingerprint: index_fingerprint,
          reason:,
          generated_at: Time.current.iso8601,
          message_count: Array(context[:messages]).size
        }
      end

      def embed_and_store_chunk(chunk)
        chunk = chunk.with_indifferent_access
        text = chunk[:text].to_s
        return false if text.blank?

        embedding_result = client.create_embedding(
          content_type: chunk[:content_type] || CONTENT_TYPE,
          content_id: chunk[:chunk_id],
          text:,
          metadata: chunk_metadata(chunk)
        )
        embedding_data = embedding_result.success? ? embedding_result.data : {}
        embedding = Array(embedding_data["embedding"]).presence

        AiEmbeddingRecord.upsert_from_orbit_ai!(
          workspace:,
          user_id: user_id&.to_s,
          content_type: chunk[:content_type] || CONTENT_TYPE,
          content_id: chunk[:chunk_id],
          title: chunk[:title],
          content: text,
          metadata: chunk_metadata(chunk).merge(
            "embedding_dimensions" => embedding_data["embedding_dimensions"].to_i,
            "embedding_status" => embedding_data["status"].presence || "unavailable",
            "embedding_error" => embedding_result.success? ? embedding_data["error"] : embedding_result.error
          ),
          embedding:
        )
      end

      def delete_stale_chunks!(stored_chunk_ids)
        scope = AiEmbeddingRecord
          .for_workspace(workspace)
          .where(content_type: CONTENT_TYPE)
          .where("metadata ->> 'conversation_content_id' = ?", conversation_content_id)
        scope = scope.where.not(content_id: stored_chunk_ids) if stored_chunk_ids.present?
        scope.delete_all
      end

      def chunk_metadata(chunk)
        chunk.fetch(:metadata, {}).to_h.merge(
          "source" => "conversation",
          "conversation_id" => conversation.id,
          "conversation_content_id" => conversation_content_id,
          "fingerprint" => index_fingerprint,
          "reason" => reason
        )
      end

      def conversation_content_id
        "conversation:#{conversation.id}"
      end

      def index_fingerprint
        @index_fingerprint ||= fingerprint.presence || Ai::ConversationFingerprint.call(workspace:, conversation:)
      end

      def failure(result)
        {
          indexed_count: 0,
          chunk_count: 0,
          conversation_id: conversation.id,
          content_id: conversation_content_id,
          error: result.error
        }
      end
    end
  end
end
