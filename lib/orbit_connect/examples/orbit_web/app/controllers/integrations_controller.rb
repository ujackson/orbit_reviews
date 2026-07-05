# frozen_string_literal: true

class IntegrationsController < ApplicationController
  def index
    render inertia: "Integrations/Index", props: {
      integrations: OrbitConnect::CatalogPresenter.new(owner: current_account).as_json
    }
  end

  def connect
    result = OrbitConnect::ConnectionManager.start!(
      provider_key: params[:id],
      owner: current_account,
      initiator: current_user,
      return_to: integrations_url
    )

    if result.redirect?
      redirect_to result.redirect_url, allow_other_host: true
    else
      render inertia: "Integrations/Connect", props: result.props
    end
  end

  def credentials
    OrbitConnect::ConnectionManager.submit_credentials!(
      provider_key: params[:id],
      owner: current_account,
      initiator: current_user,
      credentials: params.permit!.to_h
    )

    redirect_to integrations_path, notice: "Connected successfully"
  rescue OrbitConnect::Error => e
    redirect_to integrations_path, alert: e.message
  end

  def disconnect
    connection = OrbitConnect::Connection.find(params[:connection_id])
    OrbitConnect::ConnectionManager.disconnect!(connection, actor: current_user)
    redirect_to integrations_path, notice: "Disconnected successfully"
  rescue OrbitConnect::Error => e
    redirect_to integrations_path, alert: e.message
  end

  def sync
    connection = OrbitConnect::Connection.find(params[:connection_id])
    OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "manual")
    redirect_to integrations_path, notice: "Sync started"
  end
end
