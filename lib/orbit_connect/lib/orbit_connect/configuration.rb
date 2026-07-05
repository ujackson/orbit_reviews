module OrbitConnect
  class Configuration
    attr_accessor :logger,
                  :verifier_secret,
                  :oauth_callback_base_url,
                  :oauth_callback_path,
                  :mount_path,
                  :environment,
                  :token_refresh_window_seconds,
                  :sync_interval_seconds,
                  :request_timeout,
                  :open_timeout,
                  :sync_consumer,
                  :user_agent

    def initialize
      @logger = defined?(Rails) ? Rails.logger : Logger.new($stdout)
      @verifier_secret = nil
      @oauth_callback_base_url = nil
      @oauth_callback_path = nil
      @mount_path = "/orbit_connect"
      @environment = defined?(Rails) ? Rails.env : ENV.fetch("RACK_ENV", "development")
      @token_refresh_window_seconds = 10.minutes.to_i
      @sync_interval_seconds = 5.minutes.to_i
      @request_timeout = 25
      @open_timeout = 10
      @sync_consumer = ->(_envelope, connection:) { }
      @user_agent = "OrbitConnect/#{OrbitConnect::VERSION}"
    end
  end
end
