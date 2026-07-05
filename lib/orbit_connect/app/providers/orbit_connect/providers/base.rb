module OrbitConnect
  module Providers
    class Base
      class_attribute :provider_key, :display_name, :category, :capabilities,
                      :auth_strategy_class, :client_class, :sync_class,
                      :webhook_handler_class, :default_scopes, :credential_fields,
                      :oauth_site, :oauth_authorize_url, :oauth_token_url,
                      :oauth_revoke_url, :authorization_params,
                      :token_exchange_params, :pkce_enabled, default: nil

      self.capabilities = []
      self.default_scopes = []
      self.credential_fields = []

      attr_reader :connection, :provider_app

      def initialize(connection: nil, provider_app: nil)
        @connection = connection
        @provider_app = provider_app || connection&.provider_app
      end

      def auth_strategy
        auth_strategy_class.new(provider: self, connection:, provider_app:)
      end

      def client
        client_class.new(connection:, provider: self)
      end

      def sync_adapter
        sync_class.new(connection:, provider: self)
      end

      def webhook_handler(raw_body:, headers:, params:)
        (webhook_handler_class || OrbitConnect::Webhooks::BaseHandler).new(
          provider: self,
          connection:,
          raw_body:,
          headers:,
          params:
        )
      end

      def test_connection!
        client.test_connection!
      end

      def connection_attributes_from_token(_token)
        {}
      end


      class << self
        def auth_strategy_key
          auth_strategy_class.name.demodulize.underscore
        end

        def oauth?
          auth_strategy_class == OrbitConnect::AuthStrategies::Oauth2
        end

        def pkce?
          !!pkce_enabled
        end
      end
    end
  end
end
