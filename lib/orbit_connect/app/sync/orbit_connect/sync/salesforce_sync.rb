module OrbitConnect
  module Sync
    class SalesforceSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("salesforce_records")
        soql = connection.settings.fetch("default_soql", "SELECT Id, Name, LastModifiedDate FROM Account ORDER BY LastModifiedDate DESC LIMIT 200")
        response = client.query(soql)
        items = response.fetch("records", [])

        items.each do |item|
          emit!(
            resource_type: "crm_record",
            external_id: item["Id"] || item["id"],
            payload: item
          )
        end

        state.update!(
          checkpoint_at: Time.current,
          metadata: { "done" => response["done"], "trigger" => trigger }.compact
        )
      end
    end
  end
end
