# frozen_string_literal: true

class ConnectionsController < InertiaController
  include OrbitReviewsPage

  REVIEW_PROVIDER_KEYS = %w[
    google_business
    trustpilot
    apple_app_store
    google_play
    g2
  ].freeze

  def index
    accounts = Current.workspace.review_source_accounts
      .includes(:review_source)
      .order(:name)
    connections = OrbitConnect::Connection
      .where(workspace_id: Current.workspace.id)
      .includes(:credential, :provider_app)
      .order(created_at: :desc)

    render_orbit_reviews_page("Connections", {
      sourceAccounts: accounts.map { |account| ReviewSourceAccountResource.new(account).to_h },
      integrationCatalog: review_integration_catalog,
      integrationConnections: connections.map { |connection| connection_json(connection) }
    })
  end

  private

  def review_integration_catalog
    OrbitConnect::CatalogPresenter.new(workspace: Current.workspace).as_json
      .select { |provider| REVIEW_PROVIDER_KEYS.include?(provider.fetch(:id)) }
      .sort_by { |provider| REVIEW_PROVIDER_KEYS.index(provider.fetch(:id)) || REVIEW_PROVIDER_KEYS.length }
  end

  def connection_json(connection)
    {
      id: connection.id,
      integrationId: connection.provider_key,
      status: connection.status,
      connectedAt: connection.created_at&.iso8601,
      lastSync: connection.last_synced_at&.iso8601,
      lastTestedAt: connection.last_tested_at&.iso8601,
      healthStatus: connection.health_status,
      error: connection.error? || connection.health_status == "unhealthy" ? connection_error(connection) : nil,
      accountName: connection.external_name.presence || connection.external_account_id.presence,
      settings: connection.settings || {}
    }
  end

  def connection_error(connection)
    payload = connection.health_payload || {}
    payload["error_message"] || payload["error"] || payload["sync_error"] || payload["watch_error"] || payload["token_refresh_error"]
  end
end
