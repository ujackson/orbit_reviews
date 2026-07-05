module OrbitConnect
  module AuthStrategies
    class BasicAuth < Base
      def store_credentials!(credentials)
        username = credentials[:username] || credentials["username"]
        password = credentials[:password] || credentials["password"]
        raise OrbitConnect::ValidationError, "Missing username/password" if username.blank? || password.blank?

        credential.update!(
          credential_type: "basic_auth",
          secret: username,
          password: password
        )

        connection.update!(
          settings: (connection.settings || {}).merge(
            "base_url" => credentials[:base_url] || credentials["base_url"]
          ).compact
        )
      end
    end
  end
end
