module OrbitConnect
  class RefreshTokenJob < ApplicationJob
    queue_as :default

    retry_on StandardError, wait: :polynomially_longer, attempts: 6

    def perform(connection_id)
      connection = OrbitConnect::Connection.find(connection_id)
      OrbitConnect::TokenManager.refresh_if_needed!(connection)
    end
  end
end
