module OrbitConnect
  module Providers
    class Intercom < Base
      self.provider_key = :intercom
      self.display_name = "Intercom"
      self.category = "support"
      self.capabilities = %w[conversations contacts admins tags webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::IntercomClient
      self.sync_class = OrbitConnect::Sync::IntercomSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[read_conversations read_contacts read_admins]
      self.credential_fields = []
      self.oauth_site = 'https://app.intercom.com'
      self.oauth_authorize_url = '/oauth'
      self.oauth_token_url = 'https://api.intercom.io/auth/eagle/token'
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
