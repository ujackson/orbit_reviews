# frozen_string_literal: true

class IntegrationsController < ApplicationController
  before_action :set_workspace

  # GET /w/:workspace_id/integrations
  def index
    catalog = OrbitConnect::CatalogPresenter.new(workspace: Current.workspace).as_json
    connections = canonical_connections(
      OrbitConnect::Connection
      .where(workspace_id: Current.workspace.id)
      .includes(:credential, :provider_app)
      .order(created_at: :desc)
    )

    render json: {
      catalog: catalog,
      connections: connections.map { |conn| connection_json(conn) }
    }
  end

  # POST /w/:workspace_id/integrations/:provider_key/connect
  def connect
    result = OrbitConnect::ConnectionManager.start!(
      provider_key: params[:provider_key],
      workspace: Current.workspace,
      initiator: Current.user,
      return_to: workspace_settings_url(workspace_id: @workspace.id)
    )

    if result.redirect?
      render json: { redirect_url: result.redirect_url }
    else
      render json: { props: result.props }
    end
  rescue OrbitConnect::ConfigError => e
    render json: oauth_setup_required_json(params[:provider_key], e.message)
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /w/:workspace_id/integrations/:provider_key/provider_app
  def provider_app
    provider_class = OrbitConnect.provider_class(params[:provider_key])
    raise OrbitConnect::ValidationError, "#{provider_class.display_name} does not use OAuth" unless provider_class.oauth?

    attrs = provider_app_params
    provider_app = OrbitConnect::ProviderApp.find_or_initialize_by(
      provider_key: provider_class.provider_key.to_s,
      environment: OrbitConnect.config.environment.to_s,
      workspace_id: Current.workspace.id
    )

    config = provider_app_config(provider_app, provider_class, attrs)

    provider_app.update!(
      name: attrs[:name].presence || "#{provider_class.display_name} OAuth App",
      client_id: attrs[:client_id],
      client_secret: attrs[:client_secret],
      webhook_signing_secret: attrs[:webhook_signing_secret],
      config: config,
      active: true
    )

    render json: {
      success: true,
      message: "#{provider_class.display_name} OAuth app configured",
      providerApp: provider_app_json(provider_app)
    }
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.to_sentence }, status: :unprocessable_entity
  end

  # POST /w/:workspace_id/integrations/:provider_key/credentials
  def credentials
    connection = OrbitConnect::ConnectionManager.submit_credentials!(
      provider_key: params[:provider_key],
      workspace: Current.workspace,
      initiator: Current.user,
      credentials: credential_params
    )

    render json: {
      success: true,
      message: "Connected successfully",
      connection: connection_json(connection)
    }
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # DELETE /w/:workspace_id/integrations/connections/:id
  def disconnect
    connection = OrbitConnect::Connection.find(params[:id])
    authorize_connection!(connection)

    OrbitConnect::ConnectionManager.disconnect!(connection, actor: Current.user)

    render json: {
      success: true,
      message: "Disconnected successfully"
    }
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # POST /w/:workspace_id/integrations/connections/:id/sync
  def sync
    connection = OrbitConnect::Connection.find(params[:id])
    authorize_connection!(connection)

    OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "manual")

    render json: {
      success: true,
      message: "Sync started"
    }
  rescue OrbitConnect::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def set_workspace
    @workspace = Current.workspace
    head :forbidden unless @workspace
  end

  def authorize_connection!(connection)
    raise OrbitConnect::Forbidden, "Connection does not belong to this workspace" unless connection.workspace_id == Current.workspace.id
  end

  def credential_params
    params.permit!.except(:controller, :action, :workspace_id, :provider_key).to_h
  end

  def provider_app_params
    permitted = params.permit(
      :name,
      :client_id,
      :clientId,
      :client_secret,
      :clientSecret,
      :webhook_signing_secret,
      :webhookSigningSecret,
      :gmail_pubsub_topic,
      :gmailPubsubTopic,
      :gmail_pubsub_verification_token,
      :gmailPubsubVerificationToken
    )
    client_id = permitted[:client_id].presence || permitted[:clientId].presence
    client_secret = permitted[:client_secret].presence || permitted[:clientSecret].presence
    webhook_signing_secret = permitted[:webhook_signing_secret].presence || permitted[:webhookSigningSecret].presence
    gmail_pubsub_topic = permitted[:gmail_pubsub_topic].presence || permitted[:gmailPubsubTopic].presence
    gmail_pubsub_verification_token = permitted[:gmail_pubsub_verification_token].presence || permitted[:gmailPubsubVerificationToken].presence

    raise OrbitConnect::ValidationError, "Client ID is required" if client_id.blank?
    raise OrbitConnect::ValidationError, "Client secret is required" if client_secret.blank?

    {
      name: permitted[:name],
      client_id: client_id,
      client_secret: client_secret,
      webhook_signing_secret: webhook_signing_secret,
      gmail_pubsub_topic: gmail_pubsub_topic,
      gmail_pubsub_verification_token: gmail_pubsub_verification_token
    }
  end

  def provider_app_config(provider_app, provider_class, attrs)
    config = (provider_app.config || {}).dup
    return config unless provider_class.provider_key.to_s == "gmail"

    topic = attrs[:gmail_pubsub_topic].presence || config["gmail_pubsub_topic"].presence
    config["gmail_pubsub_topic"] = topic if topic.present?

    attrs[:webhook_signing_secret] =
      attrs[:gmail_pubsub_verification_token].presence ||
      attrs[:webhook_signing_secret].presence ||
      provider_app.webhook_secret.presence ||
      SecureRandom.hex(32)

    config
  end

  def oauth_setup_required_json(provider_key, message)
    provider_class = OrbitConnect.provider_class(provider_key)

    {
      setupRequired: true,
      providerKey: provider_class.provider_key.to_s,
      providerName: provider_class.display_name,
      message: message,
      redirectUri: public_url("/integrations/oauth/#{provider_class.provider_key}/callback"),
      webhookUrl: webhook_url_for(provider_class),
      gmailPubsubUrl: gmail_pubsub_url_for(provider_class),
      gmailPubsubTopic: gmail_pubsub_topic_for(provider_class),
      gmailPubsubConfigured: gmail_pubsub_configured?(provider_class),
      webhookSupported: webhook_supported?(provider_class),
      fields: [
        { name: "clientId", label: "Client ID", type: "text", required: true },
        { name: "clientSecret", label: "Client secret", type: "password", required: true }
      ] + webhook_fields_for(provider_class)
    }
  rescue OrbitConnect::Error
    { setupRequired: true, providerKey: provider_key.to_s, message: message }
  end

  def provider_app_json(provider_app)
    {
      id: provider_app.id,
      providerKey: provider_app.provider_key,
      configured: provider_app.oauth?,
      webhookConfigured: provider_app.webhook_secret.present?,
      workspaceId: provider_app.workspace_id
    }
  end

  def canonical_connections(connections)
    rank = {
      "connected" => 0,
      "syncing" => 1,
      "pending" => 2,
      "error" => 3,
      "disconnected" => 4,
      "revoking" => 5
    }

    connections
      .group_by(&:provider_key)
      .values
      .map { |provider_connections| provider_connections.min_by { |conn| [ rank.fetch(conn.status, 99), -conn.created_at.to_i ] } }
      .compact
  end

  def webhook_supported?(provider_class)
    provider_class.capabilities.include?("webhooks")
  end

  def webhook_fields_for(provider_class)
    return [] unless webhook_supported?(provider_class)

    [
      {
        name: "webhookSigningSecret",
        label: "Webhook signing secret",
        type: "password",
        required: false
      }
    ]
  end

  def webhook_url_for(provider_class)
    return nil unless webhook_supported?(provider_class)

    public_url("#{OrbitConnect.config.mount_path}/webhooks/#{provider_class.provider_key}")
  end

  def gmail_pubsub_url_for(provider_class)
    return nil unless provider_class.provider_key.to_s == "gmail"

    public_url("/integrations/gmail/pubsub")
  end

  def gmail_pubsub_topic_for(provider_class)
    return nil unless provider_class.provider_key.to_s == "gmail"

    nil
  end

  def gmail_pubsub_configured?(provider_class)
    false
  end

  def public_url(path)
    base = OrbitConnect.config.oauth_callback_base_url.presence || request.base_url
    "#{base.chomp("/")}#{path.start_with?("/") ? path : "/#{path}"}"
  end

  def connection_json(connection)
    {
      id: connection.id,
      integrationId: connection.provider_key,
      status: connection.status,
      connectedAt: connection.created_at&.iso8601,
      lastSync: connection.last_synced_at&.iso8601,
      error: connection.error? || connection.health_status == "unhealthy" ? connection_error(connection) : nil,
      accountName: connection.external_name,
      settings: connection.settings
    }
  end

  def connection_error(connection)
    payload = connection.health_payload || {}
    payload["error_message"] || payload["error"] || payload["sync_error"] || payload["watch_error"] || payload["token_refresh_error"]
  end
end
