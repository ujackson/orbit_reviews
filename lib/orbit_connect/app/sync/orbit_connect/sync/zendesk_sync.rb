module OrbitConnect
  module Sync
    class ZendeskSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("tickets")
        state.metadata ||= {}
        start_time = Time.at(state.metadata["start_time"] || 1.day.ago.to_i)
        response = client.incremental_tickets(start_time: start_time)
        items = response.dig("tickets") || []

        items.each do |item|
          emit!(
            resource_type: "ticket",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "start_time" => Time.current.to_i, "after_url" => response["after_url"], "trigger" => trigger }.compact
        )
      end
    end
  end
end
