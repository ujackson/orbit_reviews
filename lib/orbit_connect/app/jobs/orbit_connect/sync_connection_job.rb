module OrbitConnect
  class SyncConnectionJob < ApplicationJob
    queue_as :default

    retry_on OrbitConnect::RateLimited, wait: ->(executions, error) {
      error.reset_at || executions.minutes.from_now
    }, attempts: 10

    retry_on StandardError, wait: :polynomially_longer, attempts: 8

    def perform(connection_id, trigger: "manual")
      connection = OrbitConnect::Connection.find(connection_id)
      OrbitConnect::SyncRunner.call(connection:, trigger:)
    end
  end
end
