class ReviewTheme < ApplicationRecord
  include WorkspaceOwnable

  has_many :review_theme_assignments, dependent: :destroy
  has_many :reviews, through: :review_theme_assignments

  validates :name, :sentiment, :status, presence: true
end
