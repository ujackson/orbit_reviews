module OrbitConnect
  module Providers
    class Outlook < Base
      def connection_attributes_from_token(token)
        { external_account_id: token.params["id_token"].presence }.compact
      end

      self.provider_key = :outlook
      self.display_name = "Microsoft Outlook"
      self.category = "communication"
      self.capabilities = %w[messages mail_folders attachments delta_sync]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::OutlookClient
      self.sync_class = OrbitConnect::Sync::OutlookSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[offline_access Mail.Read User.Read]
      self.credential_fields = []
      self.oauth_site = 'https://login.microsoftonline.com/common/oauth2/v2.0'
      self.oauth_authorize_url = '/authorize'
      self.oauth_token_url = '/token'
      self.oauth_revoke_url = ''
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = true
    end
  end
end
