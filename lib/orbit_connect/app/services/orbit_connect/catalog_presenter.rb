module OrbitConnect
  class CatalogPresenter
    def initialize(workspace:)
      @workspace = workspace
    end

    def as_json(*)
      connections = OrbitConnect::Connection.where(workspace_id: @workspace.id).order(created_at: :desc).group_by(&:provider_key)

      OrbitConnect.registry.map do |provider_class|
        provider_connections = Array(connections[provider_class.provider_key.to_s])
        primary = provider_connections.first

        {
          id: provider_class.provider_key.to_s,
          name: provider_class.display_name,
          category: provider_class.category,
          auth_type: provider_class.auth_strategy_key.to_s,
          capabilities: provider_class.capabilities,
          status: primary&.status || "disconnected",
          connections_count: provider_connections.size,
          last_sync_at: primary&.last_synced_at,
          last_tested_at: primary&.last_tested_at,
          health_status: primary&.health_status,
          setup_url: "/integrations/#{provider_class.provider_key}/connect",
          credential_fields: provider_class.credential_fields
        }
      end
    end
  end
end
