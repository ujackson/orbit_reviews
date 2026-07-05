OrbitConnect.configure do |config|
  config.oauth_callback_base_url = ENV.fetch("APP_BASE_URL")
  config.oauth_callback_path = "/integrations/oauth"
  config.mount_path = "/orbit_connect"
  config.user_agent = "OrbitWeb/1.0"
  config.sync_consumer = lambda do |envelope, connection:|
    # map normalized records into Orbit inbox / threads / messages
    Orbit::IntegrationIngestor.call(envelope:, connection:)
  end
end
