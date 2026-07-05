class SetupOptionsSerializer < ApplicationSerializer
  STEP_KEYS = %w[workspace team channels complete].freeze
  STEPS = %w[Workspace Team Channels Complete].freeze

  attribute :steps do
    STEPS
  end

  attribute :step_keys do
    STEP_KEYS
  end

  attribute :industries do
    [ "E-commerce", "SaaS", "Healthcare", "Finance", "Education", "Marketing", "Real Estate", "Other" ]
  end

  attribute :team_sizes do
    [ "Just me", "2-10", "11-50", "51-200", "201-500", "500+" ]
  end

  attribute :use_cases do
    [
      { id: "support", label: "Customer Support", icon: "chat" },
      { id: "sales", label: "Sales Pipeline", icon: "business" },
      { id: "success", label: "Customer Success", icon: "group" },
      { id: "operations", label: "Operations & Escalations", icon: "rocket_launch" }
    ]
  end

  attribute :channels do
    [
      { id: "gmail", label: "Gmail", icon: "email", colorKey: "email" },
      { id: "outlook", label: "Microsoft Outlook", icon: "email", colorKey: "email" },
      { id: "slack", label: "Slack", icon: "chat", colorKey: "slack" },
      { id: "microsoft_teams", label: "Microsoft Teams", icon: "group", colorKey: "slack" }
    ]
  end

  typelize steps: "string[]"
  typelize step_keys: "string[]"
  typelize industries: "string[]"
  typelize team_sizes: "string[]"
  typelize use_cases: "Array<{ id: string; label: string; icon: string }>"
  typelize channels: "Array<{ id: string; label: string; icon: string; colorKey: string }>"
end
