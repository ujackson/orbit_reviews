class ReviewResource < ApplicationSerializer
  attributes :id, :external_id, :source_provider, :rating, :title, :body, :author_name,
    :product_name, :app_version, :platform, :region, :location_name, :language,
    :reviewed_at, :response_status, :workflow_status, :sentiment, :metadata

  attribute :source_account_name do |review|
    review.review_source_account&.name
  end

  attribute :analysis do |review|
    ReviewAnalysisResource.new(review.review_analysis).to_h if review.review_analysis.present?
  end

  typelize id: "number"
  typelize external_id: "string"
  typelize source_provider: "string"
  typelize rating: "number"
  typelize title: "string"
  typelize body: "string"
  typelize author_name: "string?"
  typelize product_name: "string?"
  typelize app_version: "string?"
  typelize platform: "string?"
  typelize region: "string?"
  typelize location_name: "string?"
  typelize language: "string?"
  typelize reviewed_at: "string"
  typelize response_status: "string"
  typelize workflow_status: "string"
  typelize sentiment: "string"
  typelize metadata: "Record<string, unknown>"
  typelize source_account_name: "string?"
  typelize analysis: "ReviewAnalysis?"
end
