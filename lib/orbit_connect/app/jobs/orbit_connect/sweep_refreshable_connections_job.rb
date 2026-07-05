module OrbitConnect
  class SweepRefreshableConnectionsJob < ApplicationJob
    queue_as :default

    def perform
      OrbitConnect::Connection.refreshable.find_each do |connection|
        OrbitConnect::RefreshTokenJob.perform_later(connection.id)
      end
    end
  end
end
