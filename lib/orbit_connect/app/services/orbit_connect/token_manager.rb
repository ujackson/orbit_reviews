module OrbitConnect
  class TokenManager
    class << self
      def refresh_if_needed!(connection)
        return false unless connection.credential&.refresh_token.present?
        return false unless connection.expiring_soon?

        refresh!(connection)
      end

      def refresh!(connection)
        connection.with_lock do
          connection.provider.auth_strategy.refresh!
          connection.update!(
            status: :connected,
            health_status: "healthy",
            last_tested_at: Time.current
          )
        end

        OrbitConnect::AuditLogger.log!(action: "token.refreshed", provider_key: connection.provider_key, connection:)
        true
      rescue => e
        connection.update!(
          status: :error,
          health_status: "unhealthy",
          health_payload: (connection.health_payload || {}).merge("token_refresh_error" => e.message, "refreshed_at" => Time.current.iso8601),
          failure_count: connection.failure_count.to_i + 1
        )
        raise
      end
    end
  end
end
