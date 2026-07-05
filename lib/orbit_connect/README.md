# OrbitConnect

`OrbitConnect` is a mountable Rails engine for building and operating a large integration surface from a Rails app with **Postgres + Solid Queue**.

It is designed for products like Orbit that need to manage:

- OAuth 2.0 and PKCE
- API keys / basic auth / custom base URLs
- refresh token lifecycle
- inbound webhooks
- background sync jobs
- audit logs
- rate limits, retries, and health checks
- a provider registry that is maintainable outside the host app

## What is included

This package intentionally covers the six build stages:

### Stage 1 — Package boundary
The engine owns connection orchestration, auth, sync, and webhook plumbing so the host app can keep its existing UI and call into a stable package.

### Stage 2 — Rich models
The engine ships models and migrations for:

- `OrbitConnect::ProviderApp`
- `OrbitConnect::Connection`
- `OrbitConnect::Credential`
- `OrbitConnect::SyncState`
- `OrbitConnect::WebhookEvent`
- `OrbitConnect::ConnectionAttempt`
- `OrbitConnect::AuditLog`

### Stage 3 — Service layer
The engine replaces a god-style `OAuthService` with:

- `OrbitConnect::ProviderRegistry`
- `OrbitConnect::ConnectionManager`
- `OrbitConnect::TokenManager`
- `OrbitConnect::SyncRunner`
- `OrbitConnect::WebhookIngestor`
- `OrbitConnect::HealthChecker`

### Stage 4 — Provider adapters
The engine includes a provider DSL and built-in examples:

- `OrbitConnect::Providers::Gmail`
- `OrbitConnect::Providers::Slack`
- `OrbitConnect::Providers::GenericApiKey`
- `OrbitConnect::Providers::Outlook`
- `OrbitConnect::Providers::Hubspot`
- `OrbitConnect::Providers::Zendesk`
- `OrbitConnect::Providers::Salesforce`
- `OrbitConnect::Providers::Intercom`
- `OrbitConnect::Providers::Discord`
- `OrbitConnect::Providers::Notion`
- `OrbitConnect::Providers::Stripe`

### Stage 5 — Webhook subsystem
The engine mounts dedicated callback and webhook controllers and persists raw webhook events for replay and audit.

### Stage 6 — Operations
The engine includes:

- retry-aware HTTP client
- audit logging
- refresh sweeper jobs
- health sweep jobs
- dashboard queries
- ActiveSupport notifications hooks

---

## Install in `orbit_web`

Add the gem by path:

```ruby
# Gemfile
gem "orbit_connect", path: "components/orbit_connect"
```

Install:

```bash
bundle install
bin/rails orbit_connect:install:migrations
bin/rails db:migrate
```

Mount the engine:

```ruby
# config/routes.rb
mount OrbitConnect::Engine => "/orbit_connect"
```

Configure it:

```ruby
# config/initializers/orbit_connect.rb
OrbitConnect.configure do |config|
  config.oauth_callback_base_url = ENV.fetch("APP_BASE_URL")
  config.mount_path = "/orbit_connect"
  config.user_agent = "OrbitWeb/1.0"
  config.sync_consumer = lambda do |envelope, connection:|
    # map normalized records into Orbit inbox / threads / messages
    Orbit::IntegrationIngestor.call(envelope:, connection:)
  end
end
```

### Solid Queue recurring jobs

Add a recurring schedule in the host app (example):

```yaml
# config/recurring.yml
orbit_connect_refresh_due_connections:
  class: "OrbitConnect::SweepRefreshableConnectionsJob"
  schedule: every 10 minutes

orbit_connect_health_sweep:
  class: "OrbitConnect::HealthSweepJob"
  schedule: every 30 minutes
```

---

## Host app usage

### Catalog for your integrations page

```ruby
catalog = OrbitConnect::CatalogPresenter.new(owner: current_account).as_json
```

### Start OAuth connect flow

```ruby
result = OrbitConnect::ConnectionManager.start!(
  provider_key: params[:id],
  owner: current_account,
  initiator: current_user,
  return_to: integrations_url
)

if result.redirect?
  redirect_to result.redirect_url, allow_other_host: true
else
  render inertia: "Integrations/Connect", props: result.props
end
```

### Submit API key credentials

```ruby
OrbitConnect::ConnectionManager.submit_credentials!(
  provider_key: params[:id],
  owner: current_account,
  initiator: current_user,
  credentials: {
    api_key: params[:api_key],
    base_url: params[:base_url]
  }
)
```

---

## Provider examples

### Gmail OAuth provider
Included with:
- OAuth2 auth strategy
- token refresh support
- message sync example

### Slack OAuth + webhooks
Included with:
- OAuth2 auth strategy
- signature verification
- webhook event persistence
- sync trigger example

### Generic API key provider
Included with:
- API key auth strategy
- configurable base URL
- test endpoint + sync adapter example

### Additional provider adapters included
Included as enterprise-ready starter adapters with clients + sync classes:
- Outlook / Microsoft Graph
- HubSpot
- Zendesk
- Salesforce
- Intercom
- Discord
- Notion
- Stripe

---

## Existing UI migration strategy

Keep your current Inertia / React page and replace the controller calls with this package.

See:
- `examples/orbit_web/app/controllers/integrations_controller.rb`
- `examples/orbit_web/config/initializers/orbit_connect.rb`

---

## Notes on your uploaded Knowlytics attempt

The sample you uploaded had the right instincts:
- config-driven provider list
- base sync services
- OAuth abstraction

This engine keeps the good ideas but fixes the long-term issues:
- no session-coupled OAuth state
- no giant `OAuthService`
- no provider case statements in a shared service
- no direct coupling between sync code and host app models
- support for multiple connections per provider per owner

---

## Operational design

### Secrets
Secrets use Rails Active Record Encryption on the credential/app models. Ensure the host app has Active Record Encryption configured.

### Retries and rate limits
HTTP calls use Faraday + faraday-retry. 429 responses raise a typed error with optional reset timestamps.

### Idempotency
Webhook events are stored with provider-scoped event IDs when available. Replays can use `OrbitConnect::ProcessWebhookEventJob`.

### Notifications
The engine emits notifications like:

- `orbit_connect.connection.connected`
- `orbit_connect.connection.disconnected`
- `orbit_connect.sync.started`
- `orbit_connect.sync.completed`
- `orbit_connect.webhook.received`

Hook them into logs / metrics / tracing in the host app.

---

## Folder map

```text
app/
  controllers/orbit_connect/
  jobs/orbit_connect/
  models/orbit_connect/
  services/orbit_connect/
  auth_strategies/orbit_connect/
  clients/orbit_connect/
  providers/orbit_connect/
  sync/orbit_connect/
  webhooks/orbit_connect/
```

---

## Example host controller

A ready-to-adapt controller exists at:

```text
examples/orbit_web/app/controllers/integrations_controller.rb
```

---

## Caveats

This is a strong enterprise skeleton, not a full implementation of 50 providers. The pattern is designed so you can add providers safely without turning the app into integration spaghetti.

The included providers are intentionally representative:
- one OAuth email provider
- one OAuth + webhook provider
- one API key provider
