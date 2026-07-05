module OrbitConnect
  class ProviderAppResolver
    class << self
      def resolve(provider_key:, workspace: nil, owner: nil)
        workspace ||= owner # Support both parameters for backwards compatibility
        provider_key = provider_key.to_s

        scope = OrbitConnect::ProviderApp.active.where(
          provider_key: provider_key,
          environment: OrbitConnect.config.environment.to_s
        )

        provider_app =
          if workspace
            scope.where(workspace_id: workspace.id).first || scope.where(workspace_id: nil).first
          else
            scope.where(workspace_id: nil).first
          end

        return provider_app unless oauth_provider?(provider_key)
        return provider_app if usable_oauth_app?(provider_app)
        provider_app
      end

      private

      def oauth_provider?(provider_key)
        OrbitConnect.provider_class(provider_key).oauth?
      rescue OrbitConnect::ProviderNotFound
        false
      end

      def usable_oauth_app?(provider_app)
        provider_app&.oauth?
      rescue ActiveRecord::Encryption::Errors::Decryption
        false
      end
    end
  end
end
