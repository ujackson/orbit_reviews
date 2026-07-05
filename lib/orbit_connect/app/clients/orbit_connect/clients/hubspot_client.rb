module OrbitConnect
  module Clients
    class HubspotClient < BaseClient
      def base_url
        "https://api.hubapi.com"
      end

      def test_connection!
        account = get("/account-info/v3/details")
        account["portalId"].present?
      end

      def list_contacts(after: nil, limit: 100)
        get("/crm/v3/objects/contacts", params: { after:, limit: }.compact)
      end
    end
  end
end
