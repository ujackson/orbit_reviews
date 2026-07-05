require "openssl"

module OrbitConnect
  module Webhooks
    class StripeHandler < BaseHandler
      def verify!
        secret = connection&.settings&.dig("webhook_secret") || provider_app&.settings&.dig("webhook_secret")
        return true if secret.blank?

        signature_header = headers["Stripe-Signature"].to_s
        timestamp = signature_header[/t=(\d+)/, 1]
        signatures = signature_header.scan(/v1=([^,]+)/).flatten
        return false if timestamp.blank? || signatures.empty?

        signed_payload = "#{timestamp}.#{raw_body}"
        expected = OpenSSL::HMAC.hexdigest("SHA256", secret, signed_payload)
        ActiveSupport::SecurityUtils.secure_compare(expected, signatures.first)
      end

      def process!
        payload["type"] || params[:type] || "stripe.event"
      end
    end
  end
end
