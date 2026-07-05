module OrbitConnect
  module Sync
    class BaseSync
      attr_reader :connection, :provider

      def initialize(connection:, provider:)
        @connection = connection
        @provider = provider
      end

      def client
        provider.client
      end

      def sync_state_for(resource_name)
        connection.sync_states.find_or_create_by!(resource_name: resource_name)
      end

      def emit!(resource_type:, external_id:, payload:)
        OrbitConnect::Normalizer.emit!(
          resource_type:,
          external_id:,
          payload:,
          connection:
        )
      end
    end
  end
end
