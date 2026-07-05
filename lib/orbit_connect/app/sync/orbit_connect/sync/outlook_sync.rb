module OrbitConnect
  module Sync
    class OutlookSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("outlook_messages")
        response = client.list_messages(delta_link: state.metadata&.dig("delta_link"))
        items = response.fetch("value", [])

        items.each do |item|
          emit!(
            resource_type: "mail_message",
            external_id: msg["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "delta_link" => response["@odata.deltaLink"], "next_link" => response["@odata.nextLink"], "trigger" => trigger }.compact
        )
      end
    end
  end
end
