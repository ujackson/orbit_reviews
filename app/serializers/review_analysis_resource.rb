class ReviewAnalysisResource < ApplicationSerializer
  attributes :id, :summary, :sentiment, :severity, :signals, :themes, :related_review_count, :analysis_metadata

  typelize id: "number"
  typelize summary: "string?"
  typelize sentiment: "string?"
  typelize severity: "string?"
  typelize signals: "Array<{ label: string }>"
  typelize themes: "string[]"
  typelize related_review_count: "number"
  typelize analysis_metadata: "Record<string, unknown>"
end
