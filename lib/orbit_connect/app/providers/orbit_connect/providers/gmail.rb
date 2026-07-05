module OrbitConnect
  module Providers
    class Gmail < Base
      self.provider_key = :gmail
      self.display_name = "Gmail"
      self.category = "communication"
      self.capabilities = %w[messages threads attachments conversations send]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::GmailClient
      self.sync_class = OrbitConnect::Sync::GmailSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[
        https://www.googleapis.com/auth/gmail.readonly
        https://www.googleapis.com/auth/gmail.send
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

      def connection_attributes_from_token(token)
        # Get Gmail profile to populate connection metadata
        temp_credential = OrbitConnect::Credential.new(
          access_token: token["access_token"]
        )
        temp_connection = OrbitConnect::Connection.new(credential: temp_credential)
        client_instance = client_class.new(connection: temp_connection, provider: self)

        profile = client_instance.get_profile

        {
          external_account_id: profile["emailAddress"],
          external_name: profile["emailAddress"]
        }
      rescue => e
        Rails.logger.error("Failed to fetch Gmail profile: #{e.message}")
        {}
      end
    end
  end
end
