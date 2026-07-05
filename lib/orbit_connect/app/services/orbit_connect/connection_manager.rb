require "securerandom"
require "base64"
require "openssl"
require "digest"

module OrbitConnect
  class ConnectionManager
    class << self
      def start!(provider_key:, workspace: nil, owner: nil, initiator: nil, return_to: nil, requested_scopes: nil, provider_app: nil, connection_settings: {}, connection_id: nil)
        workspace ||= owner # Support both parameters for backwards compatibility
        provider_class = OrbitConnect.provider_class(provider_key)
        provider_app ||= OrbitConnect::ProviderAppResolver.resolve(provider_key:, workspace:)
        ensure_oauth_provider_app!(provider_class:, provider_app:)
        initiator_record = persisted_record(initiator)
        connection = find_or_initialize_connection!(
          provider_key:,
          workspace:,
          initiator: initiator_record,
          provider_app:,
          connection_settings:,
          connection_id:
        )

        if provider_class.oauth?
          pkce_verifier = provider_class.pkce? ? generate_pkce_verifier : nil

          attempt = OrbitConnect::ConnectionAttempt.create!(
            connection: connection,
            workspace: workspace,
            initiator: initiator_record,
            provider_app: provider_app,
            provider_key: provider_key.to_s,
            requested_scopes: Array(requested_scopes.presence || provider_class.default_scopes),
            state_nonce: SecureRandom.hex(24),
            pkce_verifier: pkce_verifier,
            return_to: return_to,
            expires_at: 10.minutes.from_now,
            metadata: {}
          )

          redirect_url = provider_class.new(connection:, provider_app:).auth_strategy.authorize_url(connection_attempt: attempt)
          OrbitConnect::AuditLogger.log!(action: "connect.started", provider_key:, connection:, actor: initiator_record)

          OrbitConnect::StartResult.new(redirect_url:)
        else
          OrbitConnect::StartResult.new(
            props: {
              provider_key: provider_key.to_s,
              auth_strategy: provider_class.auth_strategy_key.to_s,
              fields: provider_class.credential_fields
            }
          )
        end
      end

      def submit_credentials!(provider_key:, workspace: nil, owner: nil, initiator: nil, credentials:, provider_app: nil, connection_settings: {}, connection_id: nil)
        workspace ||= owner # Support both parameters for backwards compatibility
        provider_class = OrbitConnect.provider_class(provider_key)
        if provider_class.oauth?
          raise OrbitConnect::ValidationError, "#{provider_class.display_name} uses OAuth. Start the OAuth connection flow instead."
        end

        provider_app ||= OrbitConnect::ProviderAppResolver.resolve(provider_key:, workspace:)
        initiator_record = persisted_record(initiator)

        connection = find_or_initialize_connection!(
          provider_key:,
          workspace:,
          initiator: initiator_record,
          provider_app:,
          connection_settings:,
          connection_id:
        )

        provider_class.new(connection:, provider_app:).auth_strategy.store_credentials!(credentials)
        test_connection!(connection)
        connection.update!(status: :connected, last_tested_at: Time.current, disconnected_at: nil)

        OrbitConnect::AuditLogger.log!(action: "connect.credentials_submitted", provider_key:, connection:, actor: initiator_record)
        ActiveSupport::Notifications.instrument("orbit_connect.connection.connected", connection_id: connection.id, provider_key: provider_key.to_s)
        OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "initial_connect")
        connection
      end

      def complete_oauth!(provider_key:, code:, state:)
        attempt = OrbitConnect::StateSigner.verify!(state)
        raise OrbitConnect::InvalidState, "Connection attempt expired" if attempt.expired?
        raise OrbitConnect::InvalidState, "Provider mismatch" unless attempt.provider_key.to_s == provider_key.to_s

        connection = attempt.connection
        provider = OrbitConnect.provider(provider_key, connection:, provider_app: attempt.provider_app)
        provider.auth_strategy.exchange_code!(code:, connection_attempt: attempt)

        connection.update!(status: :connected, last_tested_at: Time.current, disconnected_at: nil)
        attempt.update!(status: :completed)

        test_connection!(connection)
        ensure_provider_subscription!(connection)

        OrbitConnect::AuditLogger.log!(action: "connect.oauth_completed", provider_key:, connection:, actor: attempt.initiator)
        ActiveSupport::Notifications.instrument("orbit_connect.connection.connected", connection_id: connection.id, provider_key: provider_key.to_s)
        OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "initial_connect")
        connection
      end

      def disconnect!(connection, actor: nil)
        connection.with_lock do
          connection.update!(status: :revoking)
          begin
            connection.provider.auth_strategy.revoke!
          rescue => e
            OrbitConnect.config.logger.warn("[OrbitConnect] Failed to revoke #{connection.provider_key} token for connection #{connection.id}: #{e.class}: #{e.message}")
          end
          connection.credential&.revoke!
          connection.update!(
            status: :disconnected,
            disconnected_at: Time.current,
            health_status: nil,
            health_payload: (connection.health_payload || {}).merge("disconnected_at" => Time.current.iso8601)
          )
        end

        OrbitConnect::AuditLogger.log!(action: "connect.disconnected", provider_key: connection.provider_key, connection:, actor:)
        ActiveSupport::Notifications.instrument("orbit_connect.connection.disconnected", connection_id: connection.id, provider_key: connection.provider_key)
        connection
      end

      def test_connection!(connection)
        ok = connection.provider.test_connection!
        raise OrbitConnect::ConnectionTestFailed, "Connection test failed for #{connection.provider_key}" unless ok

        connection.update!(health_status: "healthy", health_payload: { "tested_at" => Time.current.iso8601 })
        true
      rescue => e
        connection.update!(
          status: :error,
          health_status: "unhealthy",
          health_payload: (connection.health_payload || {}).merge("error" => e.message, "tested_at" => Time.current.iso8601),
          failure_count: connection.failure_count.to_i + 1
        )
        raise
      end

      private

      def ensure_oauth_provider_app!(provider_class:, provider_app:)
        return unless provider_class.oauth?
        return if provider_app&.oauth?

        raise OrbitConnect::ConfigError, "#{provider_class.display_name} OAuth app is not configured"
      rescue ActiveRecord::Encryption::Errors::Decryption
        raise OrbitConnect::ConfigError, "#{provider_class.display_name} OAuth app credentials could not be decrypted"
      end

      def persisted_record(record)
        return record if defined?(ActiveRecord::Base) && record.is_a?(ActiveRecord::Base) && record.persisted?

        nil
      end

      def find_or_initialize_connection!(provider_key:, workspace:, initiator:, provider_app:, connection_settings:, connection_id: nil)
        connection =
          if connection_id.present?
            OrbitConnect::Connection.where(id: connection_id, workspace_id: workspace.id).first!
          else
            find_reusable_connection(provider_key:, workspace:) ||
              OrbitConnect::Connection.new(
                provider_key: provider_key.to_s,
                workspace_id: workspace.id
              )
          end

        connection.tap do |conn|
          conn.initiator ||= initiator if initiator.respond_to?(:id)
          conn.provider_app ||= provider_app if provider_app.is_a?(OrbitConnect::ProviderApp)
          conn.settings = (conn.settings || {}).merge(connection_settings.to_h.stringify_keys)
          conn.save! if conn.new_record? || conn.changed?
          cleanup_duplicate_empty_connections!(conn)
        end
      end

      def find_reusable_connection(provider_key:, workspace:)
        OrbitConnect::Connection
          .where(provider_key: provider_key.to_s, workspace_id: workspace.id)
          .where.not(status: "revoking")
          .order(
            Arel.sql(<<~SQL.squish),
              CASE status
              WHEN 'connected' THEN 0
              WHEN 'syncing' THEN 1
              WHEN 'pending' THEN 2
              WHEN 'error' THEN 3
              WHEN 'disconnected' THEN 4
              ELSE 5
              END
            SQL
            created_at: :desc
          )
          .first
      end

      def cleanup_duplicate_empty_connections!(connection)
        return if connection.new_record?

        OrbitConnect::Connection
          .left_outer_joins(:credential)
          .where(provider_key: connection.provider_key, workspace_id: connection.workspace_id)
          .where.not(id: connection.id)
          .where(status: %w[pending error disconnected])
          .where(orbit_connect_credentials: { id: nil })
          .find_each(&:destroy!)
      end

      def generate_pkce_verifier
        SecureRandom.urlsafe_base64(64).delete("=")
      end

      def ensure_provider_subscription!(connection)
        return unless connection.provider_key == "gmail"
        topic_name = connection.provider_app&.gmail_pubsub_topic
        return if topic_name.blank?

        response = connection.provider.client.watch(topic_name: topic_name)
        state = connection.sync_states.find_or_create_by!(resource_name: "gmail_watch")
        state.update!(
          cursor: response["historyId"],
          checkpoint_at: Time.current,
          metadata: {
            "expiration" => response["expiration"],
            "topic_name" => topic_name,
            "watched_at" => Time.current.iso8601
          }
        )
      rescue => e
        connection.update!(
          health_status: "unhealthy",
          health_payload: (connection.health_payload || {}).merge(
            "watch_error" => e.message,
            "watch_attempted_at" => Time.current.iso8601
          )
        )
        OrbitConnect.config.logger.warn("[OrbitConnect] Failed to configure Gmail watch for connection #{connection.id}: #{e.class}: #{e.message}")
      end
    end
  end
end
