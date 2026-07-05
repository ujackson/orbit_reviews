# frozen_string_literal: true

module Api
  class RagController < ApplicationController
    def query
      result = Ai::Rag::QueryWorkspace.call(
        workspace: Current.workspace,
        user_id: current_user_id,
        query: params.require(:query),
        filters: rag_filters,
        top_k: params.fetch(:top_k, Ai::Rag::QueryWorkspace::DEFAULT_TOP_K)
      )

      render json: result[:data] || { error: result[:error] }, status: result[:success] ? :ok : :bad_gateway
    end

    private

    def current_user_id
      user = Current.user
      return user.id if user.respond_to?(:id)

      user&.dig("id") || user&.dig(:id)
    end

    def rag_filters
      raw = params[:filters]
      return {} if raw.blank?

      raw.respond_to?(:permit) ? raw.permit(:content_type).to_h : raw.to_h.slice("content_type", :content_type)
    end
  end
end
