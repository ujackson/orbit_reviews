module OrbitConnect
  module Providers
    class G2 < Base
      self.provider_key = :g2
      self.display_name = "G2"
      self.category = "reviews"
      self.capabilities = %w[reviews products historical_sync api_token subscription_required]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::ReviewPlatformClient
      self.sync_class = OrbitConnect::Sync::ReviewPlatformSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = []
      self.credential_fields = [
        { name: "api_key", label: "G2 API token", type: "password", required: true },
        { name: "product_id", label: "Product ID", type: "text", required: true }
      ]
    end
  end
end
