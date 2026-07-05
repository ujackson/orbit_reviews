# frozen_string_literal: true

class AiArtifact < ApplicationRecord
  ARTIFACT_TYPES = %w[
    summary
    intent
    priority
    sentiment
    suggested_reply
    entities
    next_actions
  ].freeze

  belongs_to :workspace
  belongs_to :conversation
  belongs_to :ai_run

  validates :workspace_id, :conversation_id, :ai_run_id, :artifact_type, presence: true
  validates :artifact_type, inclusion: { in: ARTIFACT_TYPES }
  validates :confidence, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }, allow_nil: true
  validate :conversation_belongs_to_workspace
  validate :run_belongs_to_workspace_and_conversation

  scope :fresh, -> { where(stale: false) }
  scope :stale, -> { where(stale: true) }
  scope :for_conversation, ->(workspace:, conversation:) { where(workspace_id: workspace.id, conversation_id: conversation.id) }
  scope :by_type, ->(type) { where(artifact_type: type) }
  scope :latest_first, -> { order(generated_at: :desc, created_at: :desc) }

  private

  def conversation_belongs_to_workspace
    return if workspace_id.blank? || conversation.blank? || conversation.workspace_id == workspace_id

    errors.add(:conversation, "must belong to workspace")
  end

  def run_belongs_to_workspace_and_conversation
    return if ai_run.blank?

    errors.add(:ai_run, "must belong to workspace") if ai_run.workspace_id != workspace_id
    errors.add(:ai_run, "must belong to conversation") if ai_run.conversation_id != conversation_id
  end
end
