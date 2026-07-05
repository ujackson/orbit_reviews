class AutomationRuleResource < ApplicationSerializer
  attributes :id, :name, :trigger_type, :conditions, :action_type, :action_config,
    :status, :last_run_at, :runs_count, :failure_message

  typelize id: "number"
  typelize name: "string"
  typelize trigger_type: "string"
  typelize conditions: "Record<string, unknown>"
  typelize action_type: "string"
  typelize action_config: "Record<string, unknown>"
  typelize status: "string"
  typelize last_run_at: "string?"
  typelize runs_count: "number"
  typelize failure_message: "string?"
end
