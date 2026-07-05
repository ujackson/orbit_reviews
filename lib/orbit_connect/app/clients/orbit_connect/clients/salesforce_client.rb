module OrbitConnect
  module Clients
    class SalesforceClient < BaseClient
      def base_url
        connection.settings["instance_url"].presence || connection.credential.metadata.fetch("instance_url")
      end

      def test_connection!
        identity = get("/services/oauth2/userinfo")
        identity["organization_id"].present?
      end

      def query(soql)
        get("/services/data/v61.0/query", params: { q: soql })
      end
    end
  end
end
