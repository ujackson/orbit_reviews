# frozen_string_literal: true

module Api
  class MessagesController < ApplicationController
    def update
      message = Message.joins(:conversation)
        .where(conversations: { workspace_id: Current.workspace.id })
        .find(params[:id])

      if params[:status].present?
        case params[:status].to_s
        when "read" then message.mark_as_read!
        when "unread" then message.update!(status: :unread)
        when "archived" then message.conversation.archive!
        else raise OrbitConnect::ValidationError, "Unsupported status"
        end
      end

      render json: MessageSerializer.new(message.reload).serializable_hash
    rescue OrbitConnect::Error, ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
