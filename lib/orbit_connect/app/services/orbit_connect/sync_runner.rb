module OrbitConnect
  class SyncRunner
    class << self
      def call(connection:, trigger: "manual")
        connection.with_lock do
          connection.update!(status: :syncing)
        end

        ActiveSupport::Notifications.instrument("orbit_connect.sync.started", connection_id: connection.id, provider_key: connection.provider_key, trigger:)

        connection.provider.sync_adapter.perform(trigger:)

        connection.update!(
          status: :connected,
          last_synced_at: Time.current,
          next_sync_at: sync_interval_seconds.seconds.from_now,
          failure_count: 0,
          health_status: "healthy",
          health_payload: (connection.health_payload || {}).merge("sync_error" => nil, "synced_at" => Time.current.iso8601)
        )

        OrbitConnect::AuditLogger.log!(action: "sync.completed", provider_key: connection.provider_key, connection:, data: { trigger: trigger })
        ActiveSupport::Notifications.instrument("orbit_connect.sync.completed", connection_id: connection.id, provider_key: connection.provider_key, trigger:)
        true
      rescue => e
        connection.update!(
          status: :error,
          failure_count: connection.failure_count.to_i + 1,
          health_status: "unhealthy",
          health_payload: (connection.health_payload || {}).merge("sync_error" => e.message, "synced_at" => Time.current.iso8601)
        )
        OrbitConnect::AuditLogger.log!(action: "sync.failed", provider_key: connection.provider_key, connection:, data: { trigger: trigger, error: e.message })
        raise OrbitConnect::SyncError, e.message
      end

      private

      def sync_interval_seconds
        return OrbitConnect.config.sync_interval_seconds.to_i if OrbitConnect.config.respond_to?(:sync_interval_seconds)

        5.minutes.to_i
      end
    end
  end
end
