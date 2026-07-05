module OrbitConnect
  module Sync
    class HubspotSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("contacts")
        response = client.list_contacts(after: state.metadata&.dig("after"))
        items = response.fetch("results", [])

        items.each do |item|
          emit!(
            resource_type: "contact",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "after" => response.dig("paging", "next", "after"), "trigger" => trigger }.compact
        )
      end
    end
  end
end
