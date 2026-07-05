class AutomationRun < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :automation_rule

  validates :status, presence: true
end
