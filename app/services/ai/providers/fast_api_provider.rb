# frozen_string_literal: true

module Ai
  module Providers
    class FastApiProvider < Base
      def initialize(client: nil, model_name: nil)
        super(provider_name: "fast_api", model_name: model_name.presence || ENV.fetch("ORBIT_AI_MODEL", "gateway"))
        @client = client
      end

      def analyze_conversation(context:, workspace:, conversation:)
        client = orbit_ai_client(workspace)
        body = Array(context[:messages]).map { |message| message[:body] }.join("\n\n")
        metadata = { conversation_id: conversation.id, source: "conversation_analysis" }
        metadata[:rag_sources] = rag_sources(workspace:, conversation:, context:, body:, client:)

        response = client.analyze_email(
          source_type: "email",
          source_id: conversation.id.to_s,
          subject: context.dig(:conversation, :subject),
          body:,
          sender: context.dig(:contact, :email),
          metadata:
        )
        raise Ai::GatewayError, response.error unless response.success?

        Ai::Schemas::ConversationAnalysisSchema.normalize(map_analysis_response(response.data))
      rescue Ai::ProviderError
        raise
      rescue => e
        raise Ai::GatewayError, "AI gateway response failed normalization: #{e.class}"
      end

      private

      attr_reader :client

      def orbit_ai_client(workspace)
        client || OrbitAi::Client.new(workspace_id: workspace.id, user_id: current_user_id || "system")
      end

      def rag_sources(workspace:, conversation:, context:, body:, client:)
        query = [
          context.dig(:conversation, :subject),
          body.to_s.truncate(500, omission: "")
        ].compact_blank.join("\n")
        return [] if query.blank?

        Ai::Rag::QueryWorkspace.candidates_for(
          workspace:,
          query:,
          user_id: current_user_id || "system",
          filters: { content_type: "message" },
          top_k: 3,
          client:
        ).reject do |candidate|
          candidate.dig(:metadata, "conversation_id").to_s == conversation.id.to_s
        end.first(3).map do |candidate|
          candidate.slice(:content_id, :content_type, :title, :text, :metadata)
        end
      rescue => e
        Rails.logger.warn("AI RAG context lookup skipped: #{e.class}")
        []
      end

      def current_user_id
        user = Current.user
        return user.id if user.respond_to?(:id)

        user&.dig("id") || user&.dig(:id)
      end

      def map_analysis_response(data)
        confidence = normalized_confidence(data["confidence"])
        action_items = Array(data["action_items"]).compact_blank
        has_suggested_reply = data["suggested_reply"].present?
        suggested_actions = Array(data["suggested_actions"]).select { |action| action.respond_to?(:to_h) }.presence || action_items.map do |item|
          { "label" => item, "action_type" => "review", "confidence" => confidence, "requires_approval" => true }
        end
        suggested_actions = suggested_actions.reject do |action|
          action_hash = action.to_h
          !has_suggested_reply && (action_hash["action_type"] == "draft_reply" || action_hash["label"].to_s.downcase.include?("draft reply"))
        end
        suggested_actions.unshift({ "label" => "Draft reply", "action_type" => "draft_reply", "confidence" => confidence, "requires_approval" => true }) if has_suggested_reply && !suggested_actions.any? { |action| action.to_h["action_type"] == "draft_reply" }

        {
          "summary" => { "text" => data["summary"], "confidence" => confidence },
          "intent" => map_intent(data, confidence, action_items),
          "priority" => { "level" => data["priority"] == "low" ? "normal" : data["priority"], "confidence" => confidence, "reason" => "Suggested by orbit_ai analysis." },
          "sentiment" => { "label" => data["sentiment"], "confidence" => confidence },
          "suggested_reply" => { "draft" => data["suggested_reply"], "tone" => "professional", "confidence" => confidence },
          "entities" => Array(data["extracted_entities"]).map { |entity| map_entity(entity, confidence) },
          "next_actions" => suggested_actions.map { |action| map_action(action, confidence) }
        }
      end

      def map_intent(data, confidence, action_items)
        intent = data["intent"].respond_to?(:to_h) ? data["intent"].to_h : {}
        label = intent["label"].presence || data["category"].presence || "other"

        {
          "label" => label,
          "display_label" => display_label(intent["display_label"], label),
          "confidence" => normalized_confidence(intent["confidence"], fallback: confidence),
          "signals" => Array(intent["signals"]).presence || action_items
        }
      end

      def display_label(value, label)
        candidate = value.to_s.strip
        return label.to_s.titleize if candidate.blank? || candidate.downcase == "human label"

        candidate
      end

      def map_entity(entity, confidence)
        entity = entity.to_h
        {
          "key" => entity["key"],
          "value" => entity["value"],
          "type" => entity["type"],
          "confidence" => normalized_confidence(entity["confidence"], fallback: confidence),
          "source_message_id" => entity["source_message_id"]
        }
      end

      def map_action(action, confidence)
        action = action.to_h
        {
          "label" => action["label"],
          "action_type" => action["action_type"].presence || "review",
          "confidence" => normalized_confidence(action["confidence"], fallback: confidence),
          "requires_approval" => action.fetch("requires_approval", true)
        }
      end

      def normalized_confidence(value, fallback: 0.0)
        Float(value.presence || fallback).clamp(0.0, 1.0)
      rescue ArgumentError, TypeError
        fallback
      end
    end
  end
end
