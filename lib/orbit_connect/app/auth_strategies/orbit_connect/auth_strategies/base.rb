module OrbitConnect
  module AuthStrategies
    class Base
      attr_reader :provider, :connection, :provider_app

      def initialize(provider:, connection:, provider_app: nil)
        @provider = provider
        @connection = connection
        @provider_app = provider_app || connection&.provider_app
      end

      def authorize_url(connection_attempt:)
        raise NotImplementedError
      end

      def exchange_code!(code:, connection_attempt:)
        raise NotImplementedError
      end

      def refresh!
        raise NotImplementedError
      end

      def revoke!
        connection.credential&.revoke!
      end

      def store_credentials!(_credentials)
        raise NotImplementedError
      end

      def callback_url
        base = OrbitConnect.config.oauth_callback_base_url
        raise OrbitConnect::ConfigError, "OrbitConnect oauth_callback_base_url is not configured" if base.blank?

        path = OrbitConnect.config.oauth_callback_path.presence || "#{OrbitConnect.config.mount_path}/oauth"
        path = "/#{path}" unless path.start_with?("/")

        "#{base.chomp("/")}#{path.chomp("/")}/#{provider.class.provider_key}/callback"
      end

      private

      def credential
        connection.credential || connection.build_credential
      end
    end
  end
end
