module OrbitConnect
  module Providers
    class Hubspot < Base
      self.provider_key = :hubspot
      self.display_name = "HubSpot"
      self.category = "crm_sales"
      self.capabilities = %w[contacts conversations tickets owners webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::HubspotClient
      self.sync_class = OrbitConnect::Sync::HubspotSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[oauth crm.objects.contacts.read crm.objects.companies.read tickets conversations.read]
      self.credential_fields = []
      self.oauth_site = 'https://app.hubspot.com'
      self.oauth_authorize_url = '/oauth/authorize'
      self.oauth_token_url = 'https://api.hubapi.com/oauth/v1/token'
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = { grant_type: "authorization_code" }
      self.pkce_enabled = false
    end
  end
end
