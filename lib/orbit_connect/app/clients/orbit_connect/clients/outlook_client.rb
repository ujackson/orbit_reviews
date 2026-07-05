module OrbitConnect
  module Clients
    class OutlookClient < BaseClient
      def base_url
        "https://graph.microsoft.com"
      end

      def test_connection!
        me = get("/v1.0/me")
        me["id"].present?
      end

      def list_messages(folder: "inbox", top: 50, delta_link: nil)
        return get(delta_link.sub(base_url, "")) if delta_link.present?

        get("/v1.0/me/mailFolders/#{folder}/messages", params: {
          "$top" => top,
          "$orderby" => "receivedDateTime desc"
        })
      end
    end
  end
end
