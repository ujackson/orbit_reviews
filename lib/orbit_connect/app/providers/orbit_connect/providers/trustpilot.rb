module OrbitConnect
  module Providers
    class Trustpilot < Base
      self.provider_key = :trustpilot
      self.display_name = "Trustpilot"
      self.category = "reviews"
      self.capabilities = %w[reviews business_units historical_sync incremental_sync public_api_key private_reviews_require_oauth replies_require_oauth]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::ReviewPlatformClient
      self.sync_class = OrbitConnect::Sync::ReviewPlatformSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = []
      self.credential_fields = [
        { name: "api_key", label: "Trustpilot API key", type: "password", required: true },
        { name: "business_unit_id", label: "Business Unit ID", type: "text", required: true }
      ]
    end
  end
end
