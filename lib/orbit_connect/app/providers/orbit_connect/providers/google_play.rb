module OrbitConnect
  module Providers
    class GooglePlay < Base
      self.provider_key = :google_play
      self.display_name = "Google Play"
      self.category = "reviews"
      self.capabilities = %w[reviews apps historical_sync incremental_sync service_account oauth_supported replies]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::ReviewPlatformClient
      self.sync_class = OrbitConnect::Sync::ReviewPlatformSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = []
      self.credential_fields = [
        { name: "api_key", label: "Service account JSON", type: "password", required: true },
        { name: "package_name", label: "Package name", type: "text", required: true }
      ]
    end
  end
end
