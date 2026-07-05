class ReviewSourceAccount < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review_source
  has_many :review_sync_runs, dependent: :destroy
  has_many :reviews, dependent: :destroy

  validates :name, :status, :auth_status, presence: true
end
