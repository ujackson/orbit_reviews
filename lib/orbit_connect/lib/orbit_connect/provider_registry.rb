module OrbitConnect
  class ProviderRegistry
    include Enumerable

    def initialize
      @providers = {}
    end

    def register(provider_class)
      key = provider_class.provider_key.to_s
      raise ConfigError, "provider_key missing for #{provider_class.name}" if key.blank?

      @providers[key] = provider_class
    end

    def fetch(key)
      @providers.fetch(key.to_s) do
        raise ProviderNotFound, "Unknown provider: #{key}"
      end
    end

    def each(&block)
      @providers.values.sort_by { |klass| klass.display_name.to_s }.each(&block)
    end

    def keys
      @providers.keys
    end

    def clear!
      @providers.clear
    end
  end
end
