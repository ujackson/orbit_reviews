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
          setup_mode: setup_mode(provider_class),
          estimated_setup_minutes: estimated_setup_minutes(provider_class),
          setup_note: setup_note(provider_class),
          docs_url: docs_url(provider_class),
          security_note: security_note(provider_class),
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

    private

    def setup_mode(provider_class)
      capabilities = Array(provider_class.capabilities)
      return "oauth" if provider_class.oauth?
      return "jwt_private_key" if capabilities.include?("jwt")
      return "service_account" if capabilities.include?("service_account")

      "api_key"
    end

    def estimated_setup_minutes(provider_class)
      {
        "google_business" => 2,
        "trustpilot" => 3,
        "apple_app_store" => 5,
        "google_play" => 5,
        "g2" => 3
      }.fetch(provider_class.provider_key.to_s, 3)
    end

    def setup_note(provider_class)
      {
        "google_business" => "Uses Google OAuth and requires an Orbit-managed Google OAuth app before customers can connect.",
        "trustpilot" => "Public review import can use an API key; private review data and replies require Business-user OAuth.",
        "apple_app_store" => "Uses App Store Connect JWT credentials: issuer ID, key ID, app ID, and private key.",
        "google_play" => "Uses a Google Play service account or OAuth access with the androidpublisher scope.",
        "g2" => "Uses a G2 access token from Developer Resources; availability depends on G2 subscription/access."
      }[provider_class.provider_key.to_s]
    end

    def docs_url(provider_class)
      "/docs/integrations/#{provider_class.provider_key}.html"
    end

    def security_note(provider_class)
      if provider_class.oauth?
        "OAuth tokens are encrypted at rest. Orbit only requests review-management access needed for sync."
      elsif Array(provider_class.capabilities).include?("jwt")
        "Private keys are stored encrypted at rest. Paste only the provider key material required for API access."
      elsif Array(provider_class.capabilities).include?("service_account")
        "Service account JSON is stored encrypted at rest. Use least-privilege review permissions and rotate credentials regularly."
      else
        "API tokens are stored encrypted at rest. Do not paste unrelated secrets, customer PHI, or personal data into setup fields."
      end
    end
  end
end
