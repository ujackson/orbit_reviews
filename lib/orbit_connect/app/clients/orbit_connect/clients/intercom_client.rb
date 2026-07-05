module OrbitConnect
  module Clients
    class IntercomClient < BaseClient
      def base_url
        "https://api.intercom.io"
      end

      def test_connection!
        admins = get("/admins")
        admins["data"].is_a?(Array)
      end

      def list_conversations(starting_after: nil)
        get("/conversations", params: { per_page: 50, starting_after: }.compact)
      end
    end
  end
end
