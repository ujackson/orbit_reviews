module OrbitConnect
  module Clients
    class SlackClient < BaseClient
      def base_url
        "https://slack.com/api"
      end

      def test_connection!
        response = get("/auth.test")
        response["ok"] == true
      end

      def conversations_history(channel_id:, cursor: nil, limit: 100)
        response = get("/conversations.history", params: {
          channel: channel_id,
          cursor: cursor,
          limit: limit
        }.compact)
        raise OrbitConnect::Error, response["error"] unless response["ok"]

        response
      end

      def post_message(channel_id:, text:, thread_ts: nil)
        response = post("/chat.postMessage", body: {
          channel: channel_id,
          text: text,
          thread_ts: thread_ts
        }.compact)
        raise OrbitConnect::Error, response["error"] unless response["ok"]

        response
      end
    end
  end
end
