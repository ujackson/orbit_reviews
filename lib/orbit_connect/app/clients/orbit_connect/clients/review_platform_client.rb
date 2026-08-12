module OrbitConnect
  module Clients
    class ReviewPlatformClient < BaseClient
      def test_connection!
        credential = connection.credential
        credential&.api_key.present? || credential&.access_token.present? || credential&.secret.present?
      end
    end
  end
end
