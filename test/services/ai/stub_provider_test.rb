require "test_helper"

class AiStubProviderTest < ActiveSupport::TestCase
  test "returns required structured keys" do
    provider = Ai::Providers::StubProvider.new
    result = provider.analyze_conversation(
      context: {
        conversation: { subject: "Roadmap", priority: "normal" },
        contact: { name: "Sarah" },
        messages: [{ id: 123, body: "Can you send this by Thursday for the board?" }]
      }
    )

    assert_equal Ai::Schemas::ConversationAnalysisSchema::REQUIRED_KEYS.sort, result.keys.sort
    assert_equal "Request for Information", result.dig("intent", "display_label")
    assert_equal "high", result.dig("priority", "level")
    assert result["entities"].any?
  end
end
