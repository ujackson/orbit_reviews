class ReviewThemeResource < ApplicationSerializer
  attributes :id, :name, :description, :sentiment, :review_count, :share, :change_percent, :status, :metadata

  typelize id: "number"
  typelize name: "string"
  typelize description: "string?"
  typelize sentiment: "string"
  typelize review_count: "number"
  typelize share: "string"
  typelize change_percent: "string"
  typelize status: "string"
  typelize metadata: "Record<string, unknown>"
end
