module OrbitConnect
  module Sync
    class StripeSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("stripe_customers")
        response = client.list_customers(starting_after: state.metadata&.dig("starting_after"))
        items = response.fetch("data", [])

        items.each do |item|
          emit!(
            resource_type: "customer",
            external_id: item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "starting_after" => items.last&.dig("id"), "has_more" => response["has_more"], "trigger" => trigger }.compact
        )
      end
    end
  end
end
