module OrbitConnect
  module Providers
    class Slack < Base
      def connection_attributes_from_token(token)
        {
          external_account_id: token.params["team"]&.dig("id") || token.params["team_id"],
          external_name: token.params["team"]&.dig("name")
        }.compact
      end

      self.provider_key = :slack
      self.display_name = "Slack"
      self.category = "communication"
      self.capabilities = %w[channels messages mentions webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::SlackClient
      self.sync_class = OrbitConnect::Sync::SlackSync
      self.webhook_handler_class = OrbitConnect::Webhooks::SlackHandler
      self.default_scopes = %w[channels:history channels:read users:read chat:write]
      self.credential_fields = []
      self.oauth_site = "https://slack.com"
      self.oauth_authorize_url = "/oauth/v2/authorize"
      self.oauth_token_url = "/api/oauth.v2.access"
      self.oauth_revoke_url = "/api/auth.revoke"
      self.authorization_params = { user_scope: "" }
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
