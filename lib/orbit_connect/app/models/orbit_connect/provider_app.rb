module OrbitConnect
  class ProviderApp < ApplicationRecord
    self.table_name = "orbit_connect_provider_apps"

    belongs_to :workspace, class_name: "Workspace", optional: true

    encrypts :client_secret
    encrypts :webhook_signing_secret

    scope :active, -> { where(active: true) }

    validates :provider_key, :name, :environment, presence: true

    def oauth?
      client_id.present? && client_secret.present?
    end

    def webhook_secret
      webhook_signing_secret.presence || config.fetch("webhook_signing_secret", nil)
    end

    def gmail_pubsub_topic
      config.fetch("gmail_pubsub_topic", nil).presence || config.fetch("pubsub_topic", nil).presence
    end

    def gmail_pubsub_configured?
      provider_key.to_s == "gmail" && gmail_pubsub_topic.present? && webhook_secret.present?
    end
  end
end
