module OrbitConnect
  class SweepSyncDueConnectionsJob < ApplicationJob
    queue_as :default

    def perform
      OrbitConnect::Connection.active
        .where("next_sync_at IS NULL OR next_sync_at <= ?", Time.current)
        .find_each do |connection|
          OrbitConnect::SyncConnectionJob.perform_later(connection.id, trigger: "scheduled")
        end
    end
  end
end
