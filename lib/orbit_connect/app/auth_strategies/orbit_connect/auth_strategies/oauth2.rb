require "base64"
require "openssl"
require "digest"

module OrbitConnect
  module AuthStrategies
    class Oauth2 < Base
      def authorize_url(connection_attempt:)
        state = OrbitConnect::StateSigner.generate(connection_attempt)

        oauth_client.auth_code.authorize_url(
          {
            redirect_uri: callback_url,
            scope: Array(connection_attempt.requested_scopes).join(" "),
            state: state
          }.merge(provider.class.authorization_params || {})
           .merge(pkce_authorize_params(connection_attempt))
        )
      end

      def exchange_code!(code:, connection_attempt:)
        token = oauth_client.auth_code.get_token(
          code,
          {
            redirect_uri: callback_url
          }.merge(provider.class.token_exchange_params || {})
           .merge(pkce_token_params(connection_attempt))
        )

        persist_token!(token)
      end

      def refresh!
        raise OrbitConnect::ValidationError, "Missing refresh token" if credential.refresh_token.blank?

        access_token = OAuth2::AccessToken.new(
          oauth_client,
          credential.access_token,
          refresh_token: credential.refresh_token
        )

        token = access_token.refresh!
        persist_token!(token)
      end

      def revoke!
        revoke_url = provider.class.oauth_revoke_url
        existing_credential = connection.credential

        if revoke_url.present? && existing_credential&.access_token.present?
          Faraday.post(revoke_url) do |req|
            req.headers["Content-Type"] = "application/x-www-form-urlencoded"
            req.body = URI.encode_www_form(token: existing_credential.access_token)
          end
        end

        super
      end

      private

      def oauth_client
        app = provider_app
        raise OrbitConnect::ConfigError, "Missing provider app for #{provider.class.provider_key}" unless app&.oauth?

        @oauth_client ||= OAuth2::Client.new(
          app.client_id,
          app.client_secret,
          site: provider.class.oauth_site,
          authorize_url: provider.class.oauth_authorize_url,
          token_url: provider.class.oauth_token_url,
          connection_opts: {
            request: {
              timeout: OrbitConnect.config.request_timeout,
              open_timeout: OrbitConnect.config.open_timeout
            }
          }
        )
      end

      def persist_token!(token)
        credential.update!(
          credential_type: "oauth2",
          access_token: token.token,
          refresh_token: token.refresh_token.presence || credential.refresh_token,
          access_token_expires_at: token.expires_at ? Time.at(token.expires_at) : nil,
          scopes: token.params["scope"].to_s.split(/\s+/).reject(&:blank?),
          metadata: (credential.metadata || {}).merge(token.params.deep_stringify_keys)
        )

        attrs = provider.connection_attributes_from_token(token)
        connection.update!(attrs) if attrs.present?
      end

      def pkce_authorize_params(connection_attempt)
        return {} unless provider.class.pkce?

        challenge = Base64.urlsafe_encode64(
          OpenSSL::Digest::SHA256.digest(connection_attempt.pkce_verifier),
          padding: false
        )

        {
          code_challenge: challenge,
          code_challenge_method: "S256"
        }
      end

      def pkce_token_params(connection_attempt)
        return {} unless provider.class.pkce?

        { code_verifier: connection_attempt.pkce_verifier }
      end
    end
  end
end
