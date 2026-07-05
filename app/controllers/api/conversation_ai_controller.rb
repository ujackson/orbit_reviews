# frozen_string_literal: true

module Api
  class ConversationAiController < ApplicationController
    before_action :set_conversation

    def show
      render json: response_payload
    end

    def analyze
      queued = Ai::ScheduleConversationAnalysis.call(workspace: Current.workspace, conversation: @conversation, reason: "manual")
      audit_manual_request

      render json: { status: queued ? "queued" : "skipped", conversation_id: @conversation.id }
    end

    private

    def set_conversation
      @conversation = Current.workspace.conversations.find(params[:conversation_id])
    end

    def response_payload
      artifacts = latest_artifacts.index_by(&:artifact_type)
      ai_run = latest_run

      {
        ai_run: ai_run_payload(ai_run),
        summary: section_payload(artifacts["summary"]),
        intent: section_payload(artifacts["intent"]),
        priority: section_payload(artifacts["priority"]),
        sentiment: section_payload(artifacts["sentiment"]),
        suggested_reply: section_payload(artifacts["suggested_reply"]),
        entities: list_payload(artifacts["entities"]),
        next_actions: list_payload(artifacts["next_actions"]),
        can_analyze: true
      }
    end

    def latest_artifacts
      AiArtifact
        .for_conversation(workspace: Current.workspace, conversation: @conversation)
        .fresh
        .latest_first
        .to_a
        .uniq(&:artifact_type)
    end

    def latest_run
      AiRun
        .for_conversation(workspace: Current.workspace, conversation: @conversation)
        .recent
        .first
    end

    def ai_run_payload(ai_run)
      return nil if ai_run.blank?

      {
        id: ai_run.id,
        status: ai_run.status,
        provider: ai_run.provider,
        model: ai_run.model,
        generated_at: (ai_run.completed_at || ai_run.updated_at)&.iso8601,
        error_message: ai_run.failed? ? ai_run.error_message : nil
      }
    end

    def section_payload(artifact)
      return nil if artifact.blank?

      artifact.payload.merge(
        "confidence" => artifact.confidence || artifact.payload["confidence"],
        "generated_at" => artifact.generated_at&.iso8601
      )
    end

    def list_payload(artifact)
      return [] if artifact.blank?

      artifact.payload.fetch("items", [])
    end

    def audit_manual_request
      return unless defined?(OrbitConnect::AuditLog)

      OrbitConnect::AuditLog.create!(
        action: "ai.analysis_requested",
        provider_key: "orbit_ai",
        data: {
          reason: "manual",
          workspace_id: Current.workspace.id,
          subject_type: "Conversation",
          subject_id: @conversation.id
        }
      )
    rescue => e
      Rails.logger.warn("AI audit event failed: #{e.class}: #{e.message}")
    end
  end
end
