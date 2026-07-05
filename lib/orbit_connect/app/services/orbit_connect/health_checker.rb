module OrbitConnect
  class HealthChecker
    class << self
      def call(connection, persist: false)
        result = {
          provider_key: connection.provider_key,
          status: "healthy",
          checks: []
        }

        result[:checks] << credential_check(connection)
        result[:checks] << token_expiry_check(connection)
        result[:checks] << provider_app_check(connection)
        result[:checks] << sync_staleness_check(connection)

        unless result[:checks].all? { |check| check[:status] == "ok" }
          result[:status] = "degraded"
        end

        if persist
          connection.update!(health_status: result[:status], health_payload: result.deep_stringify_keys)
        end

        result
      end

      private

      def credential_check(connection)
        {
          name: "credential_present",
          status: connection.credential.present? ? "ok" : "error",
          detail: connection.credential.present? ? "Credential exists" : "Missing credential"
        }
      end

      def token_expiry_check(connection)
        expires_at = connection.credential&.access_token_expires_at
        return { name: "token_expiry", status: "ok", detail: "No expiring token" } if expires_at.blank?

        if expires_at <= Time.current
          { name: "token_expiry", status: "error", detail: "Access token expired" }
        elsif expires_at <= 1.hour.from_now
          { name: "token_expiry", status: "warn", detail: "Access token expires soon" }
        else
          { name: "token_expiry", status: "ok", detail: "Access token healthy" }
        end
      end

      def provider_app_check(connection)
        if connection.provider_class.oauth? && connection.provider_app.blank?
          { name: "provider_app", status: "error", detail: "Missing provider app" }
        else
          { name: "provider_app", status: "ok", detail: "Provider app configured" }
        end
      end

      def sync_staleness_check(connection)
        if connection.last_synced_at.blank?
          { name: "sync_staleness", status: "warn", detail: "Never synced" }
        elsif connection.last_synced_at < 1.day.ago
          { name: "sync_staleness", status: "warn", detail: "Last sync is stale" }
        else
          { name: "sync_staleness", status: "ok", detail: "Sync freshness acceptable" }
        end
      end
    end
  end
end
