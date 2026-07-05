class ReviewThemeAssignment < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review
  belongs_to :review_theme
end
