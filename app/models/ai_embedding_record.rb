# frozen_string_literal: true

class AiEmbeddingRecord < ApplicationRecord
  belongs_to :workspace

  has_neighbors :embedding

  validates :workspace_id, :content_type, :content_id, presence: true

  scope :for_workspace, ->(workspace) { where(workspace_id: workspace.id) }
  scope :for_content, ->(content_type, content_id) { where(content_type:, content_id:) }

  def self.upsert_from_orbit_ai!(workspace:, user_id:, content_type:, content_id:, title: nil, content: nil, metadata: {}, embedding:)
    record = find_or_initialize_by(workspace:, content_type:, content_id:)
    record.assign_attributes(user_id:, title:, content:, metadata:, embedding:)
    record.save!
    record
  end
end
