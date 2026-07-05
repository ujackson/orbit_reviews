class ReviewSourceAccountResource < ApplicationSerializer
  attributes :id, :name, :external_account_id, :status, :auth_status, :last_sync_at,
    :latest_review_at, :records_count, :sync_frequency, :metadata

  attribute :provider do |account|
    account.review_source&.provider
  end

  attribute :source_name do |account|
    account.review_source&.name
  end

  typelize id: "number"
  typelize name: "string"
  typelize external_account_id: "string?"
  typelize status: "string"
  typelize auth_status: "string"
  typelize last_sync_at: "string?"
  typelize latest_review_at: "string?"
  typelize records_count: "number"
  typelize sync_frequency: "string?"
  typelize metadata: "Record<string, unknown>"
  typelize provider: "string?"
  typelize source_name: "string?"
end
