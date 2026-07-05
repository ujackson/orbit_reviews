module OrbitConnect
  module Providers
    class GenericApiKey < Base
      self.provider_key = :generic_api_key
      self.display_name = "Generic API"
      self.category = "custom"
      self.capabilities = %w[pull api_key]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::GenericApiClient
      self.sync_class = OrbitConnect::Sync::GenericPullSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = []
      self.credential_fields = [
        { key: "base_url", label: "Base URL", type: "url", required: true },
        { key: "api_key", label: "API Key", type: "password", required: true },
        { key: "api_key_header", label: "API Key Header", type: "text", required: false, placeholder: "Authorization" },
        { key: "api_key_prefix", label: "API Key Prefix", type: "text", required: false, placeholder: "Bearer" },
        { key: "test_path", label: "Test Path", type: "text", required: false, placeholder: "/" },
        { key: "sync_path", label: "Sync Path", type: "text", required: false, placeholder: "/" }
      ]
    end
  end
end
