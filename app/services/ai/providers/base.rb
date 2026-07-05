# frozen_string_literal: true

module Ai
  module Providers
    class Base
      attr_reader :provider_name, :model_name

      def initialize(provider_name:, model_name:)
        @provider_name = provider_name
        @model_name = model_name
      end

      def analyze_conversation(context:, workspace: nil, conversation: nil)
        raise NotImplementedError
      end
    end
  end
end
