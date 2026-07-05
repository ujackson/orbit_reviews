module OrbitConnect
  module Providers
    class Notion < Base
      self.provider_key = :notion
      self.display_name = "Notion"
      self.category = "productivity"
      self.capabilities = %w[pages databases users search webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::NotionClient
      self.sync_class = OrbitConnect::Sync::NotionSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[]
      self.credential_fields = []
      self.oauth_site = 'https://api.notion.com'
      self.oauth_authorize_url = '/v1/oauth/authorize'
      self.oauth_token_url = '/v1/oauth/token'
      self.oauth_revoke_url = ''
      self.authorization_params = { owner: "user" }
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
