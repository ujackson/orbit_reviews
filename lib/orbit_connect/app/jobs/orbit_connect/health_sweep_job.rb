module OrbitConnect
  class HealthSweepJob < ApplicationJob
    queue_as :default

    def perform
      OrbitConnect::Connection.find_each do |connection|
        OrbitConnect::HealthChecker.call(connection, persist: true)
      end
    end
  end
end
