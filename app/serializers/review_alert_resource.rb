class ReviewAlertResource < ApplicationSerializer
  attributes :id, :title, :severity, :evidence, :status, :owner_name, :detected_at, :metadata

  typelize id: "number"
  typelize title: "string"
  typelize severity: "string"
  typelize evidence: "Record<string, unknown>"
  typelize status: "string"
  typelize owner_name: "string?"
  typelize detected_at: "string?"
  typelize metadata: "Record<string, unknown>"
end
