OrbitConnect.configure do |config|
  config.oauth_callback_base_url = ENV.fetch("APP_BASE_URL", "http://localhost:3000")
  config.mount_path = "/orbit_connect"
  config.user_agent = "OrbitWeb/1.0"

  # Example:
  #
  # config.sync_consumer = lambda do |envelope, connection:|
  #   Orbit::IntegrationIngestor.call(envelope:, connection:)
  # end
end
