# Adding a provider

## 1. Create a provider class

```ruby
module OrbitConnect
  module Providers
    class HubSpot < Base
      self.provider_key = :hubspot
      self.display_name = "HubSpot"
      self.category = "crm"
      self.capabilities = %w[contacts companies deals]
      self.auth_strategy_class = OrbitConnect::AuthStrategies::Oauth2
      self.client_class = OrbitConnect::Clients::HubSpotClient
      self.sync_class = OrbitConnect::Sync::HubSpotSync
      self.webhook_handler_class = OrbitConnect::Webhooks::BaseHandler
      self.default_scopes = %w[crm.objects.contacts.read]
      self.oauth_site = "https://app.hubspot.com"
      self.oauth_authorize_url = "/oauth/authorize"
      self.oauth_token_url = "/oauth/v1/token"
      self.pkce_enabled = false
    end
  end
end
```

## 2. Create a client class

Use `OrbitConnect::Clients::BaseClient` and implement:
- `base_url`
- `test_connection!`
- provider-specific methods

## 3. Create a sync adapter

Use `OrbitConnect::Sync::BaseSync` and call `emit!`.

## 4. Optional webhook handler

Implement `verify!`, `event_uid`, `event_type`, and `process!`.

## 5. Register the provider

Add it to `OrbitConnect::BuiltInProviders.register!` or register it from the host app in an initializer.
