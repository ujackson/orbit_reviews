# frozen_string_literal: true

module Api
  class ConversationsController < ApplicationController
    before_action :set_conversation, only: [:messages, :reply, :update]

    def index
      conversations = Current.workspace.conversations
        .includes(:sender, messages: [:sender, :attachments])
        .order(Arel.sql("COALESCE(conversations.last_message_at, conversations.updated_at) DESC"))

      conversations = conversations.by_status(params[:status]) if params[:status].present? && params[:status] != "all"
      conversations = conversations.where(priority: params[:priority]) if params[:priority].present? && params[:priority] != "all"
      conversations = conversations.where(channel: Array(params[:channels])) if params[:channels].present?
      conversations = apply_search(conversations, params[:searchQuery] || params[:search_query])

      render json: ConversationSerializer.new(conversations.limit(100)).serializable_hash
    end

    def messages
      render json: MessageSerializer.new(
        @conversation.messages.includes(:sender, :attachments).ordered
      ).serializable_hash
    end

    def update
      case params[:status].to_s
      when "read" then @conversation.mark_as_read!
      when "unread" then @conversation.mark_as_unread!
      when "archived" then @conversation.archive!
      when "" then nil
      else raise OrbitConnect::ValidationError, "Unsupported status"
      end

      render json: ConversationSerializer.new(@conversation.reload).serializable_hash
    rescue OrbitConnect::Error, ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def reply
      message = Orbit::OutboundMessageSender.call(
        conversation: @conversation,
        body: params.require(:body).to_s
      )

      render json: MessageSerializer.new(message).serializable_hash, status: :created
    rescue OrbitConnect::Error, ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    private

    def set_conversation
      @conversation = Current.workspace.conversations.find(params[:id])
    end

    def apply_search(scope, query)
      normalized_query = normalize_search_query(query)
      return scope if normalized_query.blank?

      pattern = "%#{ActiveRecord::Base.sanitize_sql_like(normalized_query)}%"
      matching_ids = scope
        .unscope(:order)
        .joins(
          <<~SQL.squish
            LEFT OUTER JOIN contacts conversation_search_senders
              ON conversation_search_senders.id = conversations.sender_id
            LEFT OUTER JOIN messages conversation_search_messages
              ON conversation_search_messages.conversation_id = conversations.id
          SQL
        )
        .where(
          <<~SQL.squish,
            conversations.subject ILIKE :query
            OR conversations.preview ILIKE :query
            OR conversation_search_senders.name ILIKE :query
            OR conversation_search_senders.email ILIKE :query
            OR conversation_search_messages.subject ILIKE :query
            OR conversation_search_messages.preview ILIKE :query
            OR conversation_search_messages.body ILIKE :query
          SQL
          query: pattern
        )
        .distinct
        .select(:id)

      scope.where(id: matching_ids)
    end

    def normalize_search_query(query)
      query.to_s
        .unicode_normalize(:nfkc)
        .tr("\u00A0", " ")
        .gsub(/[\u{200B}-\u{200F}\u{202A}-\u{202E}\u{2060}\u{034F}\u{00AD}]/, "")
        .squish
    end
  end
end
