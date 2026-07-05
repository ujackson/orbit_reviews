module OrbitConnect
  module Providers
    class Stripe < Base
      self.provider_key = :stripe
      self.display_name = "Stripe"
      self.category = "payments"
      self.capabilities = %w[customers charges payment_intents invoices webhooks]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::StripeClient
      self.sync_class = OrbitConnect::Sync::StripeSync
      self.webhook_handler_class = OrbitConnect::Webhooks::StripeHandler
      self.default_scopes = %w[read_only]
      self.credential_fields = []
      self.oauth_site = 'https://connect.stripe.com'
      self.oauth_authorize_url = '/oauth/authorize'
      self.oauth_token_url = '/oauth/token'
      self.oauth_revoke_url = 'https://connect.stripe.com/oauth/deauthorize'
      self.authorization_params = {}
      self.token_exchange_params = {}
      self.pkce_enabled = false
    end
  end
end
