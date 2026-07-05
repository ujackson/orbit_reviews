module OrbitConnect
  module Sync
    class IntercomSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("intercom_conversations")
        response = client.list_conversations(starting_after: state.metadata&.dig("starting_after"))
        items = response.fetch("conversations", response.fetch("data", []))

        items.each do |item|
          emit!(
            resource_type: "conversation",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "starting_after" => response.dig("pages", "next", "starting_after"), "trigger" => trigger }.compact
        )
      end
    end
  end
end
