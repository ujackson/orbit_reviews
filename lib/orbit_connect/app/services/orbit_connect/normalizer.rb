module OrbitConnect
  class Normalizer
    class << self
      def emit!(resource_type:, external_id:, payload:, connection:)
        envelope = {
          provider_key: connection.provider_key,
          connection_id: connection.id,
          workspace_id: connection.workspace_id,
          resource_type: resource_type,
          external_id: external_id.to_s,
          payload: payload,
          observed_at: Time.current.iso8601
        }

        OrbitConnect.config.sync_consumer.call(envelope, connection: connection)
        envelope
      end
    end
  end
end
