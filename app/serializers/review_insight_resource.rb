class ReviewInsightResource < ApplicationSerializer
  attributes :id, :title, :severity, :change_percent, :evidence_count, :scope, :status,
    :owner_name, :detected_at, :last_updated_at, :metadata

  typelize id: "number"
  typelize title: "string"
  typelize severity: "string"
  typelize change_percent: "string"
  typelize evidence_count: "number"
  typelize scope: "string?"
  typelize status: "string"
  typelize owner_name: "string?"
  typelize detected_at: "string?"
  typelize last_updated_at: "string?"
  typelize metadata: "Record<string, unknown>"
end
