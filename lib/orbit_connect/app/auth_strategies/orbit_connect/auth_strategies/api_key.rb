module OrbitConnect
  module AuthStrategies
    class ApiKey < Base
      def store_credentials!(credentials)
        raise OrbitConnect::ValidationError, "Missing api_key" if credentials[:api_key].blank? && credentials["api_key"].blank?

        credential.update!(
          credential_type: "api_key",
          api_key: credentials[:api_key] || credentials["api_key"],
          metadata: (credential.metadata || {}).merge("api_key_header" => credentials[:api_key_header] || credentials["api_key_header"])
        )

        connection.update!(
          settings: (connection.settings || {}).merge(
            "base_url" => credentials[:base_url] || credentials["base_url"],
            "api_key_header" => credentials[:api_key_header] || credentials["api_key_header"] || "Authorization",
            "api_key_prefix" => credentials[:api_key_prefix] || credentials["api_key_prefix"] || "Bearer"
          ).compact
        )
      end
    end
  end
end
