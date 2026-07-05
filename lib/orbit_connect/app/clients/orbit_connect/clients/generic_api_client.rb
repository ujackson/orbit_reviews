module OrbitConnect
  module Clients
    class GenericApiClient < BaseClient
      def base_url
        connection.settings.fetch("base_url")
      end

      def test_connection!
        path = connection.settings.fetch("test_path", "/")
        _response = get(path)
        true
      end

      def fetch_items
        path = connection.settings.fetch("sync_path", "/")
        get(path)
      end
    end
  end
end
