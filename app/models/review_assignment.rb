class ReviewAssignment < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review
  belongs_to :user

  validates :status, presence: true
end
