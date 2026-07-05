module OrbitConnect
  module Clients
    class NotionClient < BaseClient
      def base_url
        "https://api.notion.com"
      end

      def apply_auth!(request)
        super
        request.headers["Notion-Version"] = connection.settings.fetch("notion_version", "2022-06-28")
      end

      def test_connection!
        users = get("/v1/users")
        users["results"].is_a?(Array)
      end

      def search(start_cursor: nil)
        post("/v1/search", body: { start_cursor:, page_size: 50 }.compact)
      end
    end
  end
end
