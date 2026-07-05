module OrbitConnect
  module Providers
    class Zendesk < Base
      self.provider_key = :zendesk
      self.display_name = "Zendesk"
      self.category = "support"
      self.capabilities = %w[tickets users organizations comments incremental_export webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::ZendeskClient
      self.sync_class = OrbitConnect::Sync::ZendeskSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[read]
      self.credential_fields = ["api_key", "subdomain", "email"]
      self.oauth_site = ''
      self.oauth_authorize_url = ''
      self.oauth_token_url = ''
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
