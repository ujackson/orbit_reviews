class Contact < ApplicationRecord
  belongs_to :workspace
  has_many :messages_sent, class_name: 'Message', foreign_key: 'sender_id', dependent: :nullify
  has_many :conversations_started, class_name: 'Conversation', foreign_key: 'sender_id', dependent: :nullify

  validates :workspace_id, :email, presence: true
  validates :email, uniqueness: { scope: :workspace_id }

  before_save :generate_avatar_url, if: -> { avatar_url.blank? }

  def self.find_or_create_from_gmail(workspace_id, email, name = nil)
    find_or_create_by!(workspace_id: workspace_id, email: email) do |contact|
      contact.name = name || email.split('@').first
    end
  end

  private

  def generate_avatar_url
    # Use ui-avatars.com for simple avatar generation
    self.avatar_url = "https://ui-avatars.com/api/?name=#{CGI.escape(name || email)}&background=random"
  end
end
