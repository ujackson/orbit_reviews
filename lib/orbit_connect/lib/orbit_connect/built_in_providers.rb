module OrbitConnect
  module BuiltInProviders
    class << self
      def register!
        [
          OrbitConnect::Providers::Gmail,
          OrbitConnect::Providers::Slack,
          OrbitConnect::Providers::GenericApiKey,
          OrbitConnect::Providers::Outlook,
          OrbitConnect::Providers::Hubspot,
          OrbitConnect::Providers::Zendesk,
          OrbitConnect::Providers::Salesforce,
          OrbitConnect::Providers::Intercom,
          OrbitConnect::Providers::Discord,
          OrbitConnect::Providers::Notion,
          OrbitConnect::Providers::Stripe
        ].each do |provider_class|
          OrbitConnect.registry.register(provider_class)
        end
      end
    end
  end
end
