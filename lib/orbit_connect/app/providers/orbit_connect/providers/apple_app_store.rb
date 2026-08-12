module OrbitConnect
  module Providers
    class AppleAppStore < Base
      self.provider_key = :apple_app_store
      self.display_name = "Apple App Store"
      self.category = "reviews"
      self.capabilities = %w[reviews apps historical_sync jwt private_key replies]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::ReviewPlatformClient
      self.sync_class = OrbitConnect::Sync::ReviewPlatformSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = []
      self.credential_fields = [
        { name: "api_key", label: "Private key (.p8)", type: "password", required: true },
        { name: "issuer_id", label: "Issuer ID", type: "text", required: true },
        { name: "key_id", label: "Key ID", type: "text", required: true },
        { name: "app_id", label: "App ID", type: "text", required: true }
      ]
    end
  end
end
