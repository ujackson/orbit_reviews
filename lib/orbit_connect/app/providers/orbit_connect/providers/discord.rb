module OrbitConnect
  module Providers
    class Discord < Base
      self.provider_key = :discord
      self.display_name = "Discord"
      self.category = "communication"
      self.capabilities = %w[guilds channels messages webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::DiscordClient
      self.sync_class = OrbitConnect::Sync::DiscordSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[identify guilds]
      self.credential_fields = []
      self.oauth_site = 'https://discord.com'
      self.oauth_authorize_url = '/oauth2/authorize'
      self.oauth_token_url = '/api/oauth2/token'
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = true
    end
  end
end
