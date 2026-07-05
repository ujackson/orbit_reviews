# frozen_string_literal: true

class AiRun < ApplicationRecord
  belongs_to :workspace
  belongs_to :conversation
  has_many :ai_artifacts, dependent: :destroy

  enum :status, { pending: 0, running: 1, completed: 2, failed: 3 }

  validates :workspace_id, :conversation_id, :status, presence: true
  validate :conversation_belongs_to_workspace

  scope :for_conversation, ->(workspace:, conversation:) { where(workspace_id: workspace.id, conversation_id: conversation.id) }
  scope :recent, -> { order(created_at: :desc) }
  scope :active, -> { where(status: [:pending, :running]) }

  def start!(provider:, model:)
    update!(status: :running, provider:, model:, started_at: Time.current)
  end

  def complete!
    update!(status: :completed, completed_at: Time.current)
  end

  def fail!(error)
    update!(status: :failed, error_message: error.to_s.truncate(2_000), completed_at: Time.current)
  end

  private

  def conversation_belongs_to_workspace
    return if workspace_id.blank? || conversation.blank? || conversation.workspace_id == workspace_id

    errors.add(:conversation, "must belong to workspace")
  end
end
