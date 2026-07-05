module OrbitConnect
  module Clients
    class StripeClient < BaseClient
      def base_url
        "https://api.stripe.com"
      end

      def apply_auth!(request)
        credential = connection.credential
        request.headers["Authorization"] = "Bearer #{credential.access_token.presence || credential.api_key}"
      end

      def test_connection!
        acct = get("/v1/account")
        acct["id"].present?
      end

      def list_customers(starting_after: nil, limit: 100)
        get("/v1/customers", params: { starting_after:, limit: }.compact)
      end
    end
  end
end
