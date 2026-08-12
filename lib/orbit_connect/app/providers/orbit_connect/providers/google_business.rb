module OrbitConnect
  module Providers
    class GoogleBusiness < Base
      self.provider_key = :google_business
      self.display_name = "Google Business Profile"
      self.category = "reviews"
      self.capabilities = %w[reviews locations historical_sync incremental_sync replies oauth provider_app_required]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::ReviewPlatformClient
      self.sync_class = OrbitConnect::Sync::ReviewPlatformSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = [
        "https://www.googleapis.com/auth/business.manage"
      ]
      self.credential_fields = []
      self.oauth_site = "https://accounts.google.com"
      self.oauth_authorize_url = "/o/oauth2/v2/auth"
      self.oauth_token_url = "https://oauth2.googleapis.com/token"
      self.oauth_revoke_url = "https://oauth2.googleapis.com/revoke"
      self.authorization_params = {
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true"
      }
      self.token_exchange_params = {}
      self.pkce_enabled = true
    end
  end
end
