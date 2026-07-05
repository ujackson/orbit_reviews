module Workos
  class Client
    class << self
      def authorization_url(provider:, client_id:, redirect_uri:)
        if WorkOS::UserManagement.respond_to?(:authorization_url)
          return WorkOS::UserManagement.authorization_url(provider:, client_id:, redirect_uri:)
        end

        sdk.user_management.get_authorization_url(
          provider: provider,
          client_id: client_id,
          redirect_uri: redirect_uri
        )
      end

      def authenticate_with_code(client_id:, code:, session:)
        if WorkOS::UserManagement.respond_to?(:authenticate_with_code)
          return WorkOS::UserManagement.authenticate_with_code(client_id:, code:, session:)
        end

        response = sdk.request(
          method: :post,
          path: "/user_management/authenticate",
          auth: true,
          body: {
            "grant_type" => "authorization_code",
            "client_id" => client_id,
            "client_secret" => workos_config.fetch(:api_key),
            "code" => code,
            "session" => {
              "seal_session" => true,
              "cookie_password" => session.fetch(:cookie_password)
            }
          }
        )
        body = JSON.parse(response.body)
        sealed_session =
          body["sealed_session"].presence ||
          sdk.session_manager.seal_session_from_auth_response(
            access_token: body.fetch("access_token"),
            refresh_token: body.fetch("refresh_token"),
            cookie_password: session.fetch(:cookie_password),
            user: body["user"],
            impersonator: body["impersonator"]
          )

        AuthResponse.new(
          response: WorkOS::AuthenticateResponse.new(body),
          sealed_session: sealed_session
        )
      end

      def load_sealed_session(client_id:, session_data:, cookie_password:)
        if WorkOS::UserManagement.respond_to?(:load_sealed_session)
          return WorkOS::UserManagement.load_sealed_session(client_id:, session_data:, cookie_password:)
        end

        sdk.session_manager.load(seal_data: session_data, cookie_password: cookie_password)
      end

      def list_organization_memberships(user_id:)
        if WorkOS::UserManagement.respond_to?(:list_organization_memberships)
          return WorkOS::UserManagement.list_organization_memberships(user_id: user_id)
        end

        sdk.user_management.list_organization_memberships(user_id: user_id)
      end

      def create_organization_membership(user_id:, organization_id:)
        if WorkOS::UserManagement.respond_to?(:create_organization_membership)
          return WorkOS::UserManagement.create_organization_membership(user_id:, organization_id:)
        end

        sdk.user_management.create_organization_membership(user_id:, organization_id:)
      end

      def get_organization(id:)
        if WorkOS::Organizations.respond_to?(:get_organization)
          return WorkOS::Organizations.get_organization(id: id)
        end

        sdk.organizations.get_organization(id: id)
      end

      def delete_organization(id:)
        if WorkOS::Organizations.respond_to?(:delete_organization)
          return WorkOS::Organizations.delete_organization(id: id)
        end

        sdk.organizations.delete_organization(id: id)
      end

      private

      def sdk
        w = workos_config
        WorkOS::Client.new(
          api_key: w.fetch(:api_key),
          client_id: w.fetch(:client_id),
          logger: Rails.logger
        )
      end

      def workos_config
        Rails.configuration.auth.fetch(:workos)
      end
    end

    class AuthResponse
      attr_reader :response, :sealed_session

      def initialize(response:, sealed_session:)
        @response = response
        @sealed_session = sealed_session
      end

      def method_missing(method_name, ...)
        return response.public_send(method_name, ...) if response.respond_to?(method_name)

        super
      end

      def respond_to_missing?(method_name, include_private = false)
        response.respond_to?(method_name, include_private) || super
      end
    end
  end
end
