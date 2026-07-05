module OrbitConnect
  module Sync
    class DiscordSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("discord_guilds")
        response = client.guilds
        items = Array(response)

        items.each do |item|
          emit!(
            resource_type: "guild",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "trigger" => trigger }
        )
      end
    end
  end
end
