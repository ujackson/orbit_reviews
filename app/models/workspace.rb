class Workspace < ApplicationRecord
  validates :remote_id, presence: true, uniqueness: true

  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :contacts, dependent: :destroy
  has_many :ai_embedding_records, dependent: :destroy

  def workos_organization
    @workos_organization ||= Workos::Client.get_organization(id: remote_id)
  end
end
