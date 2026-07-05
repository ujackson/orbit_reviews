module OrbitConnect
  module Providers
    class Salesforce < Base
      self.provider_key = :salesforce
      self.display_name = "Salesforce"
      self.category = "crm_sales"
      self.capabilities = %w[accounts contacts leads cases platform_events]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::SalesforceClient
      self.sync_class = OrbitConnect::Sync::SalesforceSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[api refresh_token offline_access]
      self.credential_fields = []
      self.oauth_site = 'https://login.salesforce.com'
      self.oauth_authorize_url = '/services/oauth2/authorize'
      self.oauth_token_url = '/services/oauth2/token'
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
