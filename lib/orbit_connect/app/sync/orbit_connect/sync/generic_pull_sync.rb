module OrbitConnect
  module Sync
    class GenericPullSync < BaseSync
      def perform(trigger: "manual")
        response = client.fetch_items
        items = response.is_a?(Array) ? response : Array(response["items"] || response["data"])

        items.each do |item|
          emit!(
            resource_type: "generic_record",
            external_id: item["id"] || item[:id] || Digest::SHA256.hexdigest(item.to_json),
            payload: item
          )
        end

        sync_state_for("generic").update!(
          checkpoint_at: Time.current,
          metadata: { "trigger" => trigger }
        )
      end
    end
  end
end
