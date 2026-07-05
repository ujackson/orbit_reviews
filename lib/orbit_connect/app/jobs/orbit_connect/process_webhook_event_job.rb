module OrbitConnect
  class ProcessWebhookEventJob < ApplicationJob
    queue_as :default

    retry_on StandardError, wait: :polynomially_longer, attempts: 10

    def perform(webhook_event_id)
      event = OrbitConnect::WebhookEvent.find(webhook_event_id)
      OrbitConnect::WebhookIngestor.process!(event)
    end
  end
end
