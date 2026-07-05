class Conversation < ApplicationRecord
  belongs_to :workspace
  belongs_to :sender, class_name: 'Contact', optional: true
  has_many :messages, dependent: :destroy
  has_many :attachments, through: :messages
  has_many :ai_runs, dependent: :destroy
  has_many :ai_artifacts, dependent: :destroy

  enum :status, { unread: 0, read: 1, archived: 2 }
  enum :priority, { normal: 0, high: 1, urgent: 2 }
  enum :channel, { email: 0, sms: 1, whatsapp: 2, instagram: 3, slack: 4 }

  scope :active, -> { where(status: [:unread, :read]) }
  scope :by_channel, ->(channel) { where(channel: channel) }
  scope :by_status, ->(status) { where(status: status) unless status == 'all' }

  validates :workspace_id, :external_id, :external_source, presence: true
  validates :external_id, uniqueness: { scope: [:workspace_id, :external_source] }

  def mark_as_read!
    transaction do
      update!(status: :read, unread_count: 0)
      messages.unread.update_all(status: Message.statuses[:read])
    end
  end

  def mark_as_unread!
    update!(status: :unread)
  end

  def archive!
    update!(status: :archived)
  end

  def latest_message
    messages.order(timestamp: :desc).first
  end

  def reload_unread_count
    update!(unread_count: messages.unread.count)
  end
end
