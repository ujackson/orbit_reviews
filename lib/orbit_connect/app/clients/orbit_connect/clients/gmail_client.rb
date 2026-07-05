require "mail"

module OrbitConnect
  module Clients
    class GmailClient < BaseClient
      def base_url
        "https://gmail.googleapis.com"
      end

      def test_connection!
        profile = get_profile
        profile["emailAddress"].present?
      end

      def get_profile
        get("/gmail/v1/users/me/profile")
      end

      def list_messages(page_token: nil, max_results: 50, q: nil)
        get("/gmail/v1/users/me/messages", params: {
          pageToken: page_token,
          maxResults: max_results,
          q: q
        }.compact)
      end

      def list_history(start_history_id:, page_token: nil, history_types: ["messageAdded"])
        get("/gmail/v1/users/me/history", params: {
          startHistoryId: start_history_id,
          pageToken: page_token,
          historyTypes: history_types
        }.compact)
      end

      def get_message(message_id)
        get("/gmail/v1/users/me/messages/#{message_id}", params: { format: "full" })
      end

      def get_thread(thread_id)
        get("/gmail/v1/users/me/threads/#{thread_id}", params: { format: "full" })
      end

      def get_attachment(message_id, attachment_id)
        get("/gmail/v1/users/me/messages/#{message_id}/attachments/#{attachment_id}")
      end

      def watch(topic_name:, label_ids: ["INBOX"])
        post("/gmail/v1/users/me/watch", body: {
          topicName: topic_name,
          labelIds: label_ids
        }.compact)
      end

      def send_message(to:, subject:, body:, thread_id: nil)
        mail = Mail.new
        mail.to = to
        from_address = connection&.external_name.presence || connection&.external_account_id.presence
        mail.from = from_address if from_address.present?
        mail.subject = subject
        mail.body = body

        payload = {
          raw: Base64.urlsafe_encode64(mail.to_s, padding: false),
          threadId: thread_id
        }.compact

        post("/gmail/v1/users/me/messages/send", body: payload)
      end
    end
  end
end
