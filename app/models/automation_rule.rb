class AutomationRule < ApplicationRecord
  include WorkspaceOwnable

  has_many :automation_runs, dependent: :destroy

  validates :name, :trigger_type, :action_type, :status, presence: true
end
