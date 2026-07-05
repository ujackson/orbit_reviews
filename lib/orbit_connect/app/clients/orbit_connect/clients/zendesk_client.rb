module OrbitConnect
  module Clients
    class ZendeskClient < BaseClient
      def base_url
        subdomain = connection.settings.fetch("subdomain")
        "https://#{subdomain}.zendesk.com/api/v2"
      end

      def apply_auth!(request)
        credential = connection.credential
        token = Base64.strict_encode64("#{connection.settings.fetch('email')}/token:#{credential.api_key}")
        request.headers["Authorization"] = "Basic #{token}"
      end

      def test_connection!
        me = get("/users/me.json")
        me.dig("user", "id").present?
      end

      def incremental_tickets(start_time:)
        get("/incremental/tickets/cursor.json", params: { start_time: start_time.to_i })
      end
    end
  end
end
