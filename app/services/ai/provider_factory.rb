# frozen_string_literal: true

module Ai
  class ProviderFactory
    class << self
      def build
        case provider_key
        when "stub"
          Ai::Providers::StubProvider.new
        when "fast_api"
          Ai::Providers::FastApiProvider.new(model_name:)
        else
          raise Ai::ProviderError, "Unsupported AI provider: #{provider_key}"
        end
      end

      private

      def provider_key
        ENV["ORBIT_AI_PROVIDER"].presence || (Rails.env.test? ? "stub" : "fast_api")
      end

      def model_name
        ENV["ORBIT_AI_MODEL"].presence || Rails.application.credentials.dig(:orbit_ai, :model)
      end
    end
  end
end
