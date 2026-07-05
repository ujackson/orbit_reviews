# frozen_string_literal: true

class AnalyzeConversationJob < ApplicationJob
  queue_as :default

  def perform(workspace_id:, conversation_id:, reason: "manual", fingerprint: nil)
    workspace = Workspace.find(workspace_id)
    conversation = workspace.conversations.find(conversation_id)
    fingerprint ||= Ai::ConversationFingerprint.call(workspace:, conversation:)
    return if AiRun.for_conversation(workspace:, conversation:).running.where("metadata ->> 'fingerprint' = ?", fingerprint).exists?
    return if AiArtifact.for_conversation(workspace:, conversation:).fresh.where("metadata ->> 'fingerprint' = ?", fingerprint).exists?

    ai_run = AiRun.create!(workspace:, conversation:, status: :pending, metadata: { reason:, fingerprint: })
    Ai::AnalyzeConversation.call(workspace:, conversation:, ai_run:)
    Ai::ScheduleConversationIndex.call(workspace:, conversation:, reason: "analysis_completed")
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn("AnalyzeConversationJob skipped: #{e.message}")
  rescue => e
    ai_run&.fail!(e.message)
    Rails.logger.error("AnalyzeConversationJob failed: #{e.class}: #{safe_log_message(e)}")
    raise
  end

  private

  def safe_log_message(error)
    error.is_a?(Ai::ProviderError) ? error.message : "AI analysis failed"
  end
end
