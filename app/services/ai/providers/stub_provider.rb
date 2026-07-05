# frozen_string_literal: true

module Ai
  module Providers
    class StubProvider < Base
      def initialize
        super(provider_name: "stub", model_name: "orbit-stub-v1")
      end

      def analyze_conversation(context:, workspace: nil, conversation: nil)
        subject = context.dig(:conversation, :subject).presence || "this conversation"
        latest_text = Array(context[:messages]).last&.dig(:body).to_s
        summary_text = latest_text.presence || context.dig(:conversation, :preview).presence || "No recent message content is available."

        Ai::Schemas::ConversationAnalysisSchema.normalize(
          {
            summary: {
              text: "#{subject}: #{summary_text.truncate(180)}",
              confidence: 0.86
            },
            intent: {
              label: "request_for_information",
              display_label: "Request for Information",
              confidence: 0.82,
              signals: intent_signals(summary_text)
            },
            priority: {
              level: priority_level(context, summary_text),
              confidence: 0.76,
              reason: priority_reason(summary_text)
            },
            sentiment: {
              label: sentiment_label(summary_text),
              confidence: 0.74
            },
            suggested_reply: {
              draft: suggested_reply(context),
              tone: "professional",
              confidence: 0.79
            },
            entities: extracted_entities(context),
            next_actions: [
              { label: "Draft reply", action_type: "draft_reply", confidence: 0.8, requires_approval: true },
              { label: "Create follow-up task", action_type: "create_task", confidence: 0.72, requires_approval: true }
            ]
          }
        )
      end

      private

      def intent_signals(text)
        signals = []
        signals << "deadline" if text.match?(/deadline|today|tomorrow|thursday|friday|eod/i)
        signals << "customer request" if text.match?(/please|could you|can you|request/i)
        signals << "roadmap" if text.match?(/roadmap|plan|timeline/i)
        signals.presence || ["customer request"]
      end

      def priority_level(context, text)
        return "urgent" if context.dig(:conversation, :priority).to_s == "urgent"
        return "high" if text.match?(/urgent|asap|board|deadline|blocked/i)

        "normal"
      end

      def priority_reason(text)
        return "Message mentions a time-sensitive or executive-facing need." if text.match?(/urgent|asap|board|deadline|blocked/i)

        "No immediate escalation signal was detected."
      end

      def sentiment_label(text)
        return "negative" if text.match?(/frustrated|angry|disappointed|blocked|issue/i)
        return "positive" if text.match?(/thanks|great|appreciate|excited/i)

        "neutral"
      end

      def suggested_reply(context)
        contact = context.dig(:contact, :name).presence || "there"
        "Hi #{contact},\n\nThanks for reaching out. I have the context and will follow up with the next best update shortly.\n\nBest,"
      end

      def extracted_entities(context)
        Array(context[:messages]).filter_map do |message|
          body = message[:body].to_s
          next unless body.match?(/deadline|thursday|friday|today|tomorrow/i)

          {
            key: "deadline",
            value: body[/\b(today|tomorrow|thursday|friday)\b/i] || "mentioned deadline",
            type: "date_reference",
            confidence: 0.81,
            source_message_id: message[:id]
          }
        end.first(5)
      end
    end
  end
end
