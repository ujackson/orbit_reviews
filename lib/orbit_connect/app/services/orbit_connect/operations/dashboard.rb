module OrbitConnect
  module Operations
    class Dashboard
      class << self
        def call
          {
            total_connections: OrbitConnect::Connection.count,
            connected_connections: OrbitConnect::Connection.where(status: "connected").count,
            error_connections: OrbitConnect::Connection.where(status: "error").count,
            by_provider: OrbitConnect::Connection.group(:provider_key, :status).count,
            pending_webhooks: OrbitConnect::WebhookEvent.where(status: %w[received failed]).count
          }
        end
      end
    end
  end
end
