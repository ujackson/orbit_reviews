class ReviewSource < ApplicationRecord
  include WorkspaceOwnable

  has_many :review_source_accounts, dependent: :destroy

  validates :provider, :name, :category, :status, presence: true
end
