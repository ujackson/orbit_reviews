class Attachment < ApplicationRecord
  belongs_to :message

  enum :attachment_type, {
    image: 0, pdf: 1, document: 2, spreadsheet: 3, video: 4, other: 5
  }

  validates :message_id, :filename, presence: true

  after_commit :update_message_has_attachments

  def self.infer_type_from_mime(mime_type)
    case mime_type
    when /^image\//
      'image'
    when /pdf/
      'pdf'
    when /word|document|text/
      'document'
    when /excel|spreadsheet|csv/
      'spreadsheet'
    when /^video\//
      'video'
    else
      'other'
    end
  end

  def self.from_gmail_attachment(message_id, gmail_attachment, message_external_id)
    create!(
      message_id: message_id,
      external_id: gmail_attachment['partId'] || gmail_attachment['id'],
      filename: gmail_attachment['filename'],
      mime_type: gmail_attachment['mimeType'],
      attachment_type: infer_type_from_mime(gmail_attachment['mimeType']),
      size: gmail_attachment['size'].to_i,
      download_url: "/api/attachments/gmail/#{message_external_id}/#{gmail_attachment['partId'] || gmail_attachment['id']}",
      source: 'email'
    )
  end

  private

  def update_message_has_attachments
    message.update_column(:has_attachments, message.attachments.count > 0)
  end
end
