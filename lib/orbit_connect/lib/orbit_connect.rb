require "active_support"
require "active_support/core_ext"
require "rails"
require "faraday"
require "faraday/retry"
require "oauth2"

require_relative "orbit_connect/version"
require_relative "orbit_connect/errors"
require_relative "orbit_connect/configuration"
require_relative "orbit_connect/provider_registry"
require_relative "orbit_connect/state_signer"

module OrbitConnect
  class << self
    def config
      @config ||= Configuration.new
    end

    def configure
      yield(config)
    end

    def registry
      @registry ||= ProviderRegistry.new
    end

    def provider_class(key)
      registry.fetch(key)
    end

    def provider(key, **kwargs)
      provider_class(key).new(**kwargs)
    end

    def reset!
      @config = Configuration.new
      @registry = ProviderRegistry.new
    end
  end
end

require_relative "orbit_connect/engine"
require_relative "orbit_connect/built_in_providers"
