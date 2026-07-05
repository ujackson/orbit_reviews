# frozen_string_literal: true

module Ai
  class AnalyzeConversation
    class << self
      def call(workspace:, conversation:, ai_run: nil, provider: nil)
        new(workspace:, conversation:, ai_run:, provider:).call
      end
    end

    def initialize(workspace:, conversation:, ai_run: nil, provider: nil)
      @workspace = workspace
      @conversation = conversation
      @ai_run = ai_run || AiRun.create!(workspace:, conversation:, status: :pending)
      @provider = provider || Ai::ProviderFactory.build
    end

    def call
      raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id

      ai_run.start!(provider: provider.provider_name, model: provider.model_name) unless ai_run.running?
      context = Ai::ConversationContextBuilder.call(workspace:, conversation:)
      analysis = provider.analyze_conversation(context:, workspace:, conversation:)

      Ai::ArtifactWriter.call(
        workspace:,
        conversation:,
        ai_run:,
        analysis:,
        provider: provider.provider_name,
        model: provider.model_name,
        metadata: { fingerprint: ai_run.metadata["fingerprint"] }.compact
      )

      ai_run.complete!
      broadcast_completed
      ai_run
    rescue => e
      ai_run.fail!(safe_error_message(e)) if ai_run&.persisted? && !ai_run.completed?
      raise
    end

    private

    attr_reader :workspace, :conversation, :ai_run, :provider

    def broadcast_completed
      return unless defined?(ActionCable)

      ActionCable.server.broadcast(
        "workspace:#{workspace.id}:ai",
        {
          type: "ai.analysis.completed",
          payload: {
            workspace_id: workspace.id,
            conversation_id: conversation.id,
            ai_run_id: ai_run.id,
            status: ai_run.status
          }
        }
      )
    rescue => e
      Rails.logger.warn("AI realtime broadcast failed: #{e.class}: #{e.message}")
    end

    def safe_error_message(error)
      case error
      when Ai::GatewayError, Ai::ProviderError
        error.message
      else
        "#{error.class}: AI analysis failed"
      end
    end
  end
end
