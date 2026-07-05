class WebhooksController < ApplicationController
  allow_unauthenticated_access
  skip_before_action :verify_authenticity_token

  def workos
    payload = request.body.read
    signature = request.headers["WorkOS-Signature"]

    begin
      # Verify webhook signature
      event = WorkOS::Webhooks.construct_event(
        payload: payload,
        sig_header: signature,
        secret: ENV["WORKOS_WEBHOOK_SECRET"]
      )

      # Process event based on type
      case event.event
      when "organization.created"
        handle_organization_created(event.data)
      when "organization.updated"
        handle_organization_updated(event.data)
      when "organization.deleted"
        handle_organization_deleted(event.data)
      when "organization_membership.created"
        handle_membership_upsert(event.data)
      when "organization_membership.updated"
        handle_membership_upsert(event.data)
      when "organization_membership.deleted"
        handle_membership_deleted(event.data)
      else
        Rails.logger.info "Unhandled webhook event: #{event.event}"
      end

      head :ok
    rescue WorkOS::SignatureVerificationError => e
      Rails.logger.error "Webhook signature verification failed: #{e.message}"
      head :bad_request
    rescue => e
      Rails.logger.error "Webhook processing error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      head :internal_server_error
    end
  end

  private

  def handle_organization_created(data)
    workspace = find_or_initialize_workspace(data)
    workspace.save!

    Rails.logger.info "Workspace created/synced from WorkOS org #{workspace.remote_id}"
  end

  def handle_organization_updated(data)
    workspace = find_or_initialize_workspace(data)
    workspace.save!

    Rails.logger.info "Workspace updated from WorkOS org #{workspace.remote_id}"
  end

  def handle_organization_deleted(data)
    workspace = Workspace.find_by(remote_id: payload_value(data, :id))
    return unless workspace

    workspace.destroy!
    Rails.logger.info "Workspace deleted for WorkOS org #{payload_value(data, :id)}"
  end

  def handle_membership_deleted(data)
    Rails.logger.info "Membership deleted: #{payload_value(data, :id)}"
  end

  def handle_membership_upsert(data)
    org_id = payload_value(data, :organization_id)
    return if org_id.blank?

    organization = Workos::Client.get_organization(id: org_id)
    workspace = find_or_initialize_workspace(organization)
    workspace.save!

    Rails.logger.info "Workspace synced from WorkOS membership #{payload_value(data, :id)} for org #{org_id}"
  rescue StandardError => e
    Rails.logger.error "Membership webhook sync failed for org #{org_id}: #{e.class}: #{e.message}"
    raise
  end

  def find_or_initialize_workspace(data)
    external_id = payload_value(data, :external_id)
    remote_id = payload_value(data, :id)

    if external_id.present?
      Workspace.find_or_initialize_by(id: external_id).tap { |workspace| workspace.remote_id = remote_id }
    else
      Workspace.find_or_initialize_by(remote_id: remote_id)
    end
  end

  def payload_value(payload, key)
    if payload.respond_to?(key)
      payload.public_send(key)
    elsif payload.respond_to?(:[])
      payload[key] || payload[key.to_s]
    end
  end
end
