# frozen_string_literal: true

module Integrations
  class GmailPubsubController < ApplicationController
    skip_before_action :verify_authenticity_token
    skip_before_action :require_authentication
    skip_before_action :require_workspace

    def create
      notification = decoded_notification
      email = notification["emailAddress"].to_s
      history_id = notification["historyId"].to_s
      return head :accepted if email.blank?

      connections = OrbitConnect::Connection.active
        .where(provider_key: "gmail", external_account_id: email)
        .includes(:provider_app)
        .select { |connection| valid_token_for?(connection) }

      return head :unauthorized if connections.empty?

      connections.each do |connection|
        state = connection.sync_states.find_or_create_by!(resource_name: "gmail_history")
        state.update!(
          metadata: (state.metadata || {}).merge(
            "pending_history_id" => history_id,
            "pubsub_received_at" => Time.current.iso8601
          )
        )
        OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "gmail_pubsub")
      end

      head :accepted
    rescue JSON::ParserError, ArgumentError => e
      Rails.logger.warn("Invalid Gmail Pub/Sub payload: #{e.class}: #{e.message}")
      head :bad_request
    end

    private

    def valid_token_for?(connection)
      expected = connection.provider_app&.webhook_secret.to_s
      actual = params[:token].to_s
      expected.present? && actual.present? && ActiveSupport::SecurityUtils.secure_compare(expected, actual)
    end

    def decoded_notification
      encoded = params.dig(:message, :data) || params.dig("message", "data")
      raise ArgumentError, "missing Pub/Sub message data" if encoded.blank?

      JSON.parse(Base64.decode64(encoded))
    end
  end
end
