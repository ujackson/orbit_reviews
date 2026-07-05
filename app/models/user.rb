class User < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :workspaces, through: :memberships
  has_many :review_assignments, dependent: :destroy

  validates :email, presence: true
end
