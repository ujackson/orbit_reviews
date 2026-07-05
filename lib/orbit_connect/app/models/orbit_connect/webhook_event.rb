module OrbitConnect
  class WebhookEvent < ApplicationRecord
    self.table_name = "orbit_connect_webhook_events"

    belongs_to :connection, class_name: "OrbitConnect::Connection", optional: true

    enum :status,
         {
           received: "received",
           processing: "processing",
           processed: "processed",
           ignored: "ignored",
           failed: "failed"
         },
         default: "received",
         validate: true

    scope :pending_processing, -> { where(status: %w[received failed]) }
  end
end
