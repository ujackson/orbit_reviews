# frozen_string_literal: true

module Ai
  module Schemas
    class ConversationAnalysisSchema
      REQUIRED_KEYS = %w[
        summary
        intent
        priority
        sentiment
        suggested_reply
        entities
        next_actions
      ].freeze

      class << self
        def normalize(payload)
          data = payload.respond_to?(:to_h) ? payload.to_h : payload
          data = data.deep_stringify_keys

          missing = REQUIRED_KEYS - data.keys
          raise Ai::ProviderError, "AI response missing keys: #{missing.join(', ')}" if missing.any?

          {
            "summary" => normalize_hash(data["summary"], "text", "confidence"),
            "intent" => normalize_hash(data["intent"], "label", "display_label", "confidence", "signals"),
            "priority" => normalize_hash(data["priority"], "level", "confidence", "reason"),
            "sentiment" => normalize_hash(data["sentiment"], "label", "confidence"),
            "suggested_reply" => normalize_hash(data["suggested_reply"], "draft", "tone", "confidence"),
            "entities" => Array(data["entities"]).map { |entity| normalize_hash(entity, "key", "value", "type", "confidence", "source_message_id") },
            "next_actions" => Array(data["next_actions"]).map { |action| normalize_hash(action, "label", "action_type", "confidence", "requires_approval") }
          }
        rescue NoMethodError, TypeError => e
          raise Ai::ProviderError, "AI response was not structured JSON: #{e.message}"
        end

        def json_schema
          {
            type: "object",
            required: REQUIRED_KEYS,
            additionalProperties: false,
            properties: {
              summary: { type: "object" },
              intent: { type: "object" },
              priority: { type: "object" },
              sentiment: { type: "object" },
              suggested_reply: { type: "object" },
              entities: { type: "array", items: { type: "object" } },
              next_actions: { type: "array", items: { type: "object" } }
            }
          }
        end

        private

        def normalize_hash(value, *allowed_keys)
          value.to_h.deep_stringify_keys.slice(*allowed_keys)
        end
      end
    end
  end
end
