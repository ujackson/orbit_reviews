# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_workspace

    def connect
      self.current_workspace = authenticated_workspace
      Current.workspace = current_workspace
    rescue => e
      Rails.logger.warn("Action Cable authentication failed: #{e.class}: #{e.message}")
      reject_unauthorized_connection
    end

    private

    def authenticated_workspace
      sealed_session = cookies.encrypted[session_cookie_key] || cookies[session_cookie_key]
      raise "missing session" if sealed_session.blank?

      case Rails.configuration.auth.fetch(:provider)
      when :workos
        authenticate_workos_session(sealed_session)
      else
        raise "unsupported auth provider"
      end
    end

    def authenticate_workos_session(sealed_session)
      workos = Rails.configuration.auth.fetch(:workos)
      session = Workos::Client.load_sealed_session(
        client_id: workos.fetch(:client_id),
        session_data: sealed_session,
        cookie_password: workos.fetch(:cookie_password)
      )
      result = session.authenticate
      raise "unauthenticated session" unless result[:authenticated]

      Current.user = result[:user]
      organization_id = result[:organization_id] || result[:org_id] || result["organization_id"] || result["org_id"]
      raise "missing organization" if organization_id.blank?

      Workspace.find_by!(remote_id: organization_id)
    end

    def session_cookie_key
      Rails.configuration.auth.fetch(:session_cookie).to_s
    end
  end
end
