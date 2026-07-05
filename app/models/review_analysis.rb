class ReviewAnalysis < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :review
end
