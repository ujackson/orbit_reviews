class Membership < ApplicationRecord
  include WorkspaceOwnable

  belongs_to :user

  validates :role, :status, presence: true
end
