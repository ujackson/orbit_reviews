class ReviewSyncRun < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review_source_account

  validates :status, presence: true
end
