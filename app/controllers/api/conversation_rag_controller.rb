# frozen_string_literal: true

require "timeout"

module Api
  class ConversationRagController < ApplicationController
    INLINE_INDEX_TIMEOUT = 12.seconds

    before_action :set_conversation

    def index
      result = Ai::Rag::IndexConversation.call(
        workspace: Current.workspace,
        conversation: @conversation,
        user_id: current_user_id
      )

      status = result[:error].present? ? :bad_gateway : :ok
      render json: result, status:
    end

    def query
      index_result = ensure_conversation_indexed
      if index_result[:pending]
        render json: indexing_response(index_result), status: :ok
        return
      elsif index_result[:error].present?
        render json: { error: index_result[:error] }, status: :bad_gateway
        return
      end

      result = Ai::Rag::QueryWorkspace.call(
        workspace: Current.workspace,
        user_id: current_user_id,
        query: conversation_query,
        filters: rag_filters(default: { content_type: "message" }).merge(
          conversation_content_id: conversation_content_id
        ),
        top_k: params.fetch(:top_k, Ai::Rag::QueryWorkspace::DEFAULT_TOP_K)
      )

      render json: (result[:data] || { error: result[:error] }).merge(
        indexed_count: index_result[:indexed_count],
        chunk_count: index_result[:chunk_count]
      ), status: result[:success] ? :ok : :bad_gateway
    end

    private

    def set_conversation
      @conversation = Current.workspace.conversations.find(params[:conversation_id])
    end

    def current_user_id
      user = Current.user
      return user.id if user.respond_to?(:id)

      user&.dig("id") || user&.dig(:id)
    end

    def rag_filters(default: {})
      raw = params[:filters]
      return default if raw.blank?

      raw.respond_to?(:permit) ? raw.permit(:content_type).to_h : raw.to_h.slice("content_type", :content_type)
    end

    def conversation_query
      question = params.require(:query).to_s
      subject = @conversation.subject.to_s
      return question if subject.blank?

      "Selected conversation subject: #{subject}\nUser question: #{question}"
    end

    def ensure_conversation_indexed
      existing_count = indexed_chunks_count
      if existing_count.positive?
        enqueue_indexing_job if embedded_chunks_count.zero?
        return { indexed_count: existing_count, chunk_count: existing_count, conversation_id: @conversation.id, reused: true }
      end

      result = Timeout.timeout(INLINE_INDEX_TIMEOUT) do
        Ai::Rag::IndexConversation.call(
          workspace: Current.workspace,
          conversation: @conversation,
          user_id: current_user_id
        )
      end
      return result if result[:error].present? || result[:indexed_count].to_i.positive?

      enqueue_indexing_job
      result.merge(pending: true)
    rescue Timeout::Error
      enqueue_indexing_job
      { pending: true, indexed_count: 0, chunk_count: 0, conversation_id: @conversation.id }
    end

    def indexed_chunks_count
      AiEmbeddingRecord
        .for_workspace(Current.workspace)
        .where(content_type: "message")
        .where("metadata ->> 'conversation_content_id' = ?", conversation_content_id)
        .count
    end

    def embedded_chunks_count
      AiEmbeddingRecord
        .for_workspace(Current.workspace)
        .where(content_type: "message")
        .where("metadata ->> 'conversation_content_id' = ?", conversation_content_id)
        .where.not(embedding: nil)
        .count
    end

    def conversation_content_id
      "conversation:#{@conversation.id}"
    end

    def enqueue_indexing_job
      Ai::ScheduleConversationIndex.call(
        workspace: Current.workspace,
        conversation: @conversation,
        reason: "conversation_rag_query"
      )
    end

    def indexing_response(index_result)
      {
        answer: "Workspace knowledge is indexing this conversation. Try again in a moment.",
        sources: [],
        indexed_count: index_result[:indexed_count],
        chunk_count: index_result[:chunk_count],
        indexing: true
      }
    end
  end
end
