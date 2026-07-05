class Review < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review_source_account
  has_one :review_analysis, dependent: :destroy
  has_many :review_theme_assignments, dependent: :destroy
  has_many :review_themes, through: :review_theme_assignments
  has_many :review_reply_drafts, dependent: :destroy
  has_many :review_assignments, dependent: :destroy

  validates :external_id, :source_provider, :rating, :title, :body, :reviewed_at, :workflow_status, :sentiment, presence: true
end
