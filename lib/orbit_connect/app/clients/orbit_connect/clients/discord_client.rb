module OrbitConnect
  module Clients
    class DiscordClient < BaseClient
      def base_url
        "https://discord.com/api/v10"
      end

      def test_connection!
        user = get("/users/@me")
        user["id"].present?
      end

      def guilds
        get("/users/@me/guilds")
      end
    end
  end
end
