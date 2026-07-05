# frozen_string_literal: true

module Ai
  class ArtifactWriter
    class << self
      def call(workspace:, conversation:, ai_run:, analysis:, provider:, model:, metadata: {})
        new(workspace:, conversation:, ai_run:, analysis:, provider:, model:, metadata:).call
      end
    end

    def initialize(workspace:, conversation:, ai_run:, analysis:, provider:, model:, metadata: {})
      @workspace = workspace
      @conversation = conversation
      @ai_run = ai_run
      @analysis = Ai::Schemas::ConversationAnalysisSchema.normalize(analysis)
      @provider = provider
      @model = model
      @metadata = metadata
    end

    def call
      raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id

      AiArtifact.transaction do
        artifact_rows.each do |artifact_type, payload|
          mark_previous_stale!(artifact_type)
          create_artifact!(artifact_type, payload)
        end
      end
    end

    private

    attr_reader :workspace, :conversation, :ai_run, :analysis, :provider, :model, :metadata

    def artifact_rows
      analysis.slice(*AiArtifact::ARTIFACT_TYPES)
    end

    def mark_previous_stale!(artifact_type)
      AiArtifact
        .for_conversation(workspace:, conversation:)
        .by_type(artifact_type)
        .fresh
        .update_all(stale: true, updated_at: Time.current)
    end

    def create_artifact!(artifact_type, payload)
      normalized_payload = payload.is_a?(Array) ? { "items" => payload } : payload

      AiArtifact.create!(
        workspace:,
        conversation:,
        ai_run:,
        artifact_type:,
        payload: normalized_payload,
        provider:,
        model:,
        confidence: confidence_for(payload),
        generated_at: Time.current,
        metadata:
      )
    end

    def confidence_for(payload)
      if payload.is_a?(Array)
        values = payload.filter_map { |item| item["confidence"] || item[:confidence] }
        return nil if values.empty?

        values.sum.to_f / values.length
      else
        payload["confidence"] || payload[:confidence]
      end
    end
  end
end
