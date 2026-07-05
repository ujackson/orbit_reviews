module OrbitConnect
  module Sync
    class GmailSync < BaseSync
      def perform(trigger: "manual")
        state = sync_state_for("messages")
        history_state = sync_state_for("gmail_history")
        ids =
          if history_state.cursor.present?
            history_message_ids(history_state.cursor)
          else
            response = client.list_messages(page_token: state.cursor, max_results: 50)
            state.update!(
              cursor: response.dig("nextPageToken"),
              checkpoint_at: Time.current,
              metadata: (state.metadata || {}).merge("trigger" => trigger)
            )
            Array(response["messages"]).map { |item| item["id"] }
          end

        ids.each do |message_id|
          message = client.get_message(message_id)
          normalize_and_persist(message)
        end

        profile = client.get_profile
        history_state.update!(
          cursor: profile["historyId"].presence || history_state.metadata&.dig("pending_history_id") || history_state.cursor,
          checkpoint_at: Time.current,
          metadata: (history_state.metadata || {}).merge("trigger" => trigger).except("pending_history_id")
        )
        ensure_watch!
      end

      private

      def history_message_ids(start_history_id)
        ids = []
        page_token = nil

        loop do
          response = client.list_history(start_history_id:, page_token:)
          Array(response["history"]).each do |history|
            Array(history["messagesAdded"]).each do |entry|
              ids << entry.dig("message", "id")
            end
          end
          page_token = response["nextPageToken"]
          break if page_token.blank?
        end

        ids.compact.uniq
      rescue OrbitConnect::Error => e
        Rails.logger.warn("Gmail history sync fell back to full list: #{e.message}")
        response = client.list_messages(max_results: 50)
        Array(response["messages"]).map { |item| item["id"] }
      end

      def ensure_watch!
        topic_name = connection.provider_app&.gmail_pubsub_topic
        return if topic_name.blank?

        watch_state = sync_state_for("gmail_watch")
        expiration = watch_state.metadata&.dig("expiration").to_i
        return if expiration > 1.day.from_now.to_i * 1000

        response = client.watch(topic_name:)
        watch_state.update!(
          cursor: response["historyId"],
          checkpoint_at: Time.current,
          metadata: {
            "expiration" => response["expiration"],
            "topic_name" => topic_name,
            "watched_at" => Time.current.iso8601
          }
        )
      rescue => e
        Rails.logger.warn("Failed to configure Gmail watch: #{e.class}: #{e.message}")
      end

      def normalize_and_persist(gmail_message)
        headers = Array(gmail_message.dig("payload", "headers"))

        # Extract basic fields
        thread_id = gmail_message["threadId"]
        message_id = gmail_message["id"]
        subject = header_value(headers, "Subject") || "(No Subject)"
        from_header = header_value(headers, "From") || "unknown@gmail.com"
        snippet = gmail_message["snippet"]
        internal_date = gmail_message["internalDate"]
        label_ids = Array(gmail_message["labelIds"])
        is_unread = label_ids.include?("UNREAD")

        # Parse sender email and name
        sender_email, sender_name = parse_email_header(from_header)

        # Find workspace from connection's owner
        workspace = find_workspace
        return unless workspace

        # Find or create contact
        contact = ::Contact.find_or_create_from_gmail(workspace.id, sender_email, sender_name)

        # Find or create conversation (grouped by thread)
        conversation = ::Conversation.find_or_initialize_by(
          workspace_id: workspace.id,
          external_id: thread_id,
          external_source: 'gmail'
        )

        if conversation.new_record?
          conversation.assign_attributes(
            subject: subject,
            preview: snippet,
            channel: :email,
            sender_id: contact.id,
            status: is_unread ? :unread : :read,
            last_message_at: Time.at(internal_date.to_i / 1000)
          )
          conversation.save!
        end

        # Find or create message
        message = ::Message.find_or_initialize_by(
          conversation_id: conversation.id,
          external_id: message_id
        )

        if message.new_record?
          message.assign_attributes(
            external_source: 'gmail',
            sender_id: contact.id,
            channel: :email,
            subject: subject,
            body: extract_body(gmail_message),
            preview: snippet,
            timestamp: Time.at(internal_date.to_i / 1000),
            status: is_unread ? :unread : :read,
            labels: label_ids.reject { |l| l.start_with?("CATEGORY_") || l.start_with?("SYSTEM_") }
          )
          message.save!
        end

        # Sync attachments
        parts = extract_attachment_parts(gmail_message.dig("payload"))
        if parts.any?
          sync_attachments(message, parts)
        end

        # Update conversation metadata
        conversation.update!(
          last_message_at: [conversation.last_message_at, message.timestamp].compact.max,
          unread_count: conversation.messages.unread.count
        )
        ::Ai::ScheduleConversationAnalysis.call(workspace:, conversation:, reason: "gmail_sync")

        Rails.logger.info("Gmail sync: Persisted message #{message_id} in thread #{thread_id}")
      rescue => e
        Rails.logger.error("Gmail sync error for message #{gmail_message['id']}: #{e.message}")
        Rails.logger.error(e.backtrace.first(5).join("\n"))
      end

      def sync_attachments(message, parts)
        parts.each do |part|
          next unless part["filename"].present?

          attachment_id = part.dig("body", "attachmentId") || part["partId"]
          next if attachment_id.blank?

          ::Attachment.find_or_create_by!(
            message_id: message.id,
            external_id: attachment_id
          ) do |att|
            att.filename = part["filename"]
            att.mime_type = part["mimeType"]
            att.attachment_type = ::Attachment.infer_type_from_mime(part["mimeType"])
            att.size = part.dig("body", "size").to_i
            att.download_url = "/api/attachments/gmail/#{message.external_id}/#{attachment_id}"
            att.source = 'email'
          end
        end

        message.update_column(:has_attachments, message.attachments.count > 0)
      end

      def extract_attachment_parts(payload, parts = [])
        return parts unless payload

        # Check if this part is an attachment
        if payload["filename"].present? && payload.dig("body", "attachmentId").present?
          parts << payload
        end

        # Recursively check nested parts
        if payload["parts"].present?
          payload["parts"].each do |part|
            extract_attachment_parts(part, parts)
          end
        end

        parts
      end

      def extract_body(gmail_message)
        payload = gmail_message["payload"]
        return "" unless payload

        # Try to find text/html first, fallback to text/plain
        body_data = find_body_data(payload, "text/html") || find_body_data(payload, "text/plain")

        return "" if body_data.blank?

        begin
          Base64.urlsafe_decode64(body_data)
        rescue => e
          Rails.logger.error("Failed to decode Gmail body: #{e.message}")
          ""
        end
      end

      def find_body_data(payload, mime_type)
        # Check if this payload matches the mime type
        if payload["mimeType"] == mime_type
          return payload.dig("body", "data")
        end

        # Recursively search in parts
        if payload["parts"].present?
          payload["parts"].each do |part|
            data = find_body_data(part, mime_type)
            return data if data.present?
          end
        end

        nil
      end

      def parse_email_header(from_header)
        # Parse "Name <email@domain.com>" format
        if from_header.include?('<')
          name = from_header[/^(.*)</, 1].to_s.strip.gsub(/^"|"$/, '')
          email = from_header[/<(.+?)>/, 1]
        else
          email = from_header.strip
          name = email.split('@').first
        end
        [email, name]
      end

      def normalize_message(message)
        headers = Array(message.dig("payload", "headers"))
        {
          id: message["id"],
          thread_id: message["threadId"],
          snippet: message["snippet"],
          subject: header_value(headers, "Subject"),
          from: header_value(headers, "From"),
          to: header_value(headers, "To"),
          internal_date: message["internalDate"]
        }
      end

      def header_value(headers, key)
        headers.find { |header| header["name"] == key }&.dig("value")
      end

      def find_workspace
        # connection.workspace should be a Workspace
        connection&.workspace
      end
    end
  end
end
