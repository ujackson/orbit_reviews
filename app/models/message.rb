class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: 'Contact'
  has_many :attachments, dependent: :destroy

  enum :status, { unread: 0, read: 1, archived: 2 }
  enum :priority, { normal: 0, high: 1, urgent: 2 }
  enum :channel, { email: 0, sms: 1, whatsapp: 2, instagram: 3, slack: 4 }
  enum :direction, { inbound: 0, outbound: 1, internal_note: 2 }

  scope :unread, -> { where(status: :unread) }
  scope :ordered, -> { order(timestamp: :asc) }

  validates :conversation_id, :external_id, :channel, presence: true
  validates :external_id, uniqueness: { scope: :conversation_id }

  before_save :update_has_attachments
  after_save :update_conversation_metadata
  after_destroy :update_conversation_metadata
  after_commit :schedule_conversation_knowledge_index, on: [:create, :update, :destroy]

  def mark_as_read!
    update!(status: :read)
    conversation.reload_unread_count
  end

  def self.from_gmail_message(conversation_id, gmail_message_data, sender)
    create!(
      conversation_id: conversation_id,
      external_id: gmail_message_data['id'],
      external_source: 'gmail',
      sender_id: sender.id,
      channel: :email,
      subject: gmail_message_data['subject'],
      body: gmail_message_data['body'],
      preview: gmail_message_data['snippet'],
      timestamp: Time.at(gmail_message_data['internal_date'].to_i / 1000),
      status: gmail_message_data['is_unread'] ? :unread : :read,
      labels: gmail_message_data['label_names'] || []
    )
  end

  private

  def update_has_attachments
    self.has_attachments = attachments.any?
  end

  def update_conversation_metadata
    conversation.update!(
      last_message_at: conversation.messages.maximum(:timestamp),
      unread_count: conversation.messages.unread.count
    )
  end

  def schedule_conversation_knowledge_index
    return if conversation.blank? || conversation.destroyed?
    return unless destroyed? || saved_change_to_body? || saved_change_to_subject? || saved_change_to_timestamp? || saved_change_to_sender_id?

    Ai::ScheduleConversationIndex.call(workspace: conversation.workspace, conversation:, reason: "message_changed")
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn("Message knowledge indexing skipped: #{e.message}")
  end
end
