class MessageSerializer < ApplicationSerializer
  attributes :id, :channel, :subject, :preview, :body, :status, :priority, :labels, :direction

  attribute :sender do |message|
    message.sender ? ContactSerializer.new(message.sender).serializable_hash : { id: nil, name: "Unknown", email: nil, avatar: "?" }
  end

  attribute :timestamp do |message|
    message.timestamp&.iso8601 || message.created_at&.iso8601
  end

  attribute :body_format do |message|
    body_format_for(message.body)
  end

  attribute :service do |message|
    message.external_source
  end

  attribute :has_attachments do |message|
    message.has_attachments?
  end

  attribute :attachment_count do |message|
    message.attachments.size
  end

  attribute :attachments do |message|
    AttachmentSerializer.new(message.attachments).serializable_hash
  end

  private

  def body_format_for(body)
    text = body.to_s.lstrip
    return "html" if text.match?(/\A<!doctype html/i) || text.match?(/\A<html[\s>]/i) || text.include?("<body") || text.match?(/<([a-z][a-z0-9:-]*)(\s[^>]*)?>/i)
    return "markdown" if text.match?(/(^|\n)\s{0,3}\#{1,6}\s/) || text.include?("```") || text.match?(/\*\*[^*]+\*\*/)

    "text"
  end
end
