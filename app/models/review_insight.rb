class ReviewInsight < ApplicationRecord
  include WorkspaceOwnable

  validates :title, :severity, :status, presence: true
end
