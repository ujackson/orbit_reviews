class ReviewReplyDraft < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review
  belongs_to :created_by, class_name: "User", optional: true
  belongs_to :approved_by, class_name: "User", optional: true

  validates :body, :status, presence: true
end
