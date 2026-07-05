module OrbitConnect
  class Error < StandardError; end
  class ConfigError < Error; end
  class ProviderNotFound < Error; end
  class InvalidState < Error; end
  class Unauthorized < Error; end
  class Forbidden < Error; end

  class RateLimited < Error
    attr_reader :reset_at

    def initialize(message = "Rate limit exceeded", reset_at: nil)
      @reset_at = reset_at
      super(message)
    end
  end

  class ConnectionTestFailed < Error; end
  class WebhookVerificationFailed < Error; end
  class SyncError < Error; end
  class ValidationError < Error; end
end
