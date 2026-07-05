class ConversationSerializer < ApplicationSerializer
  attributes :id, :channel, :subject, :preview, :status, :priority, :labels

  attribute :sender do |conversation|
    contact = conversation.sender || conversation.latest_message&.sender
    contact ? ContactSerializer.new(contact).serializable_hash : { id: nil, name: "Unknown", email: nil, avatar: "?" }
  end

  attribute :body do |conversation|
    conversation.latest_message&.body || conversation.preview
  end

  attribute :body_format do |conversation|
    body_format_for(conversation.latest_message&.body)
  end

  attribute :service do |conversation|
    conversation.external_source
  end

  attribute :timestamp do |conversation|
    (conversation.last_message_at || conversation.updated_at)&.iso8601
  end

  attribute :has_attachments do |conversation|
    conversation.attachments.exists?
  end

  attribute :attachment_count do |conversation|
    conversation.attachments.size
  end

  attribute :attachments do |conversation|
    AttachmentSerializer.new(conversation.attachments.limit(3)).serializable_hash
  end

  attribute :thread_count do |conversation|
    conversation.messages.size
  end

  private

  def body_format_for(body)
    text = body.to_s.lstrip
    return "html" if text.match?(/\A<!doctype html/i) || text.match?(/\A<html[\s>]/i) || text.include?("<body") || text.match?(/<([a-z][a-z0-9:-]*)(\s[^>]*)?>/i)
    return "markdown" if text.match?(/(^|\n)\s{0,3}\#{1,6}\s/) || text.include?("```") || text.match?(/\*\*[^*]+\*\*/)

    "text"
  end
end
