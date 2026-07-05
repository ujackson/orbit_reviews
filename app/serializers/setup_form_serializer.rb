class SetupFormSerializer < ApplicationSerializer
  attributes :workspace_name, :industry, :team_size, :role, :use_cases, :channels

  typelize workspace_name: "string?"
  typelize industry: "string?"
  typelize team_size: "string?"
  typelize role: "string?"
  typelize use_cases: "string?[]"
  typelize channels: "string?[]"

  def self.form_default_overrides
    {
      use_cases: [],
      channels: []
    }
  end
end
