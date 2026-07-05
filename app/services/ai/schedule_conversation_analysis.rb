# frozen_string_literal: true

module Ai
  class ScheduleConversationAnalysis
    DEBOUNCE_WINDOW = 2.minutes

    class << self
      def call(workspace:, conversation:, reason: "gmail_sync")
        new(workspace:, conversation:, reason:).call
      end
    end

    def initialize(workspace:, conversation:, reason:)
      @workspace = workspace
      @conversation = conversation
      @reason = reason
    end

    def call
      raise ActiveRecord::RecordNotFound, "Conversation not found in workspace" unless conversation.workspace_id == workspace.id
      fingerprint = Ai::ConversationFingerprint.call(workspace:, conversation:)
      return false if already_analyzed_or_scheduled?(fingerprint)

      AnalyzeConversationJob.perform_later(workspace_id: workspace.id, conversation_id: conversation.id, reason:, fingerprint:)
      true
    end

    private

    attr_reader :workspace, :conversation, :reason

    def already_analyzed_or_scheduled?(fingerprint)
      recently_active? || fresh_artifacts_for_fingerprint?(fingerprint)
    end

    def recently_active?
      AiRun
        .for_conversation(workspace:, conversation:)
        .where(status: [:pending, :running])
        .where("created_at >= ?", DEBOUNCE_WINDOW.ago)
        .exists?
    end

    def fresh_artifacts_for_fingerprint?(fingerprint)
      AiArtifact
        .for_conversation(workspace:, conversation:)
        .fresh
        .where("metadata ->> 'fingerprint' = ?", fingerprint)
        .exists?
    end
  end
end
