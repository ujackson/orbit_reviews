module OrbitConnect
  class StateSigner
    PURPOSE = "orbit_connect.oauth_state".freeze

    class << self
      def generate(connection_attempt)
        verifier.generate(
          {
            attempt_id: connection_attempt.id,
            provider_key: connection_attempt.provider_key,
            nonce: connection_attempt.state_nonce,
            exp: connection_attempt.expires_at.to_i
          },
          purpose: PURPOSE
        )
      end

      def verify!(state)
        payload = verifier.verify(state, purpose: PURPOSE).deep_symbolize_keys
        raise InvalidState, "OAuth state expired" if payload[:exp].to_i < Time.current.to_i

        attempt = OrbitConnect::ConnectionAttempt.find(payload[:attempt_id])

        unless ActiveSupport::SecurityUtils.secure_compare(payload[:nonce].to_s, attempt.state_nonce.to_s)
          raise InvalidState, "OAuth state nonce mismatch"
        end

        attempt
      rescue ActiveSupport::MessageVerifier::InvalidSignature
        raise InvalidState, "OAuth state signature invalid"
      end

      private

      def verifier
        secret = OrbitConnect.config.verifier_secret ||
                 Rails.application.secret_key_base ||
                 ENV["SECRET_KEY_BASE"]

        raise ConfigError, "Missing verifier secret for OrbitConnect" if secret.blank?

        @verifier ||= ActiveSupport::MessageVerifier.new(secret, serializer: JSON)
      end
    end
  end
end
