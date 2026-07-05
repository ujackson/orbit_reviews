module OrbitConnect
  module Sync
    class SlackSync < BaseSync
      def perform(trigger: "manual")
        channel_ids = Array(connection.settings["channel_ids"])
        return if channel_ids.empty?

        channel_ids.each do |channel_id|
          state = sync_state_for("channel:#{channel_id}")
          response = client.conversations_history(channel_id:, cursor: state.cursor, limit: 100)

          Array(response["messages"]).each do |message|
            emit!(
              resource_type: "chat_message",
              external_id: "#{channel_id}:#{message['ts']}",
              payload: {
                channel_id: channel_id,
                thread_ts: message["thread_ts"],
                text: message["text"],
                user: message["user"],
                ts: message["ts"]
              }
            )
          end

          state.update!(
            cursor: response.dig("response_metadata", "next_cursor").presence,
            checkpoint_at: Time.current,
            metadata: (state.metadata || {}).merge("trigger" => trigger)
          )
        end
      end
    end
  end
end
