module OrbitConnect
  module Sync
    class NotionSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("notion_objects")
        response = client.search(start_cursor: state.metadata&.dig("next_cursor"))
        items = response.fetch("results", [])

        items.each do |item|
          emit!(
            resource_type: "page",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "next_cursor" => response["next_cursor"], "has_more" => response["has_more"], "trigger" => trigger }.compact
        )
      end
    end
  end
end
