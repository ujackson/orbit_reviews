class AttachmentSerializer < ApplicationSerializer
  attributes :id, :size, :source

  attribute :name do |attachment|
    attachment.filename
  end

  attribute :type do |attachment|
    attachment.attachment_type
  end

  attribute :mime_type do |attachment|
    attachment.mime_type
  end

  attribute :url do |attachment|
    attachment.download_url
  end

  attribute :uploaded_at do |attachment|
    attachment.created_at&.iso8601
  end

  attribute :include_in_ai do |_attachment|
    true
  end

  attribute :ai_summary do |attachment|
    case attachment.attachment_type
    when "pdf"
      "PDF attachment available for AI analysis: #{attachment.filename}. Content extraction is metadata-only in this phase."
    when "image"
      "Image attachment available for AI description: #{attachment.filename}. Visual analysis will run after file-content extraction is enabled."
    when "spreadsheet"
      "Spreadsheet attachment available for AI extraction: #{attachment.filename}. Row-level extraction is not enabled yet."
    when "document"
      "Document attachment available for AI analysis: #{attachment.filename}. Content extraction is metadata-only in this phase."
    else
      "Attachment available for AI analysis: #{attachment.filename}. Content extraction is metadata-only in this phase."
    end
  end

  attribute :ai_extracted_fields do |attachment|
    {
      "File type" => attachment.attachment_type.to_s.titleize,
      "MIME type" => attachment.mime_type.to_s.presence || "Unknown",
      "Size" => ActiveSupport::NumberHelper.number_to_human_size(attachment.size.to_i)
    }
  end

  attribute :ai_description do |attachment|
    "Orbit has attachment metadata for #{attachment.filename}; raw file contents are not sent to AI in Phase 1."
  end
end
