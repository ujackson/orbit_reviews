module OrbitConnect
  class Connection < ApplicationRecord
    self.table_name = "orbit_connect_connections"

    belongs_to :workspace, class_name: "Workspace"
    belongs_to :initiator, polymorphic: true, optional: true
    belongs_to :provider_app, class_name: "OrbitConnect::ProviderApp", optional: true

    has_one :credential, class_name: "OrbitConnect::Credential", dependent: :destroy
    has_many :sync_states, class_name: "OrbitConnect::SyncState", dependent: :destroy
    has_many :webhook_events, class_name: "OrbitConnect::WebhookEvent", dependent: :nullify
    has_many :audit_logs, class_name: "OrbitConnect::AuditLog", dependent: :nullify
    has_many :connection_attempts, class_name: "OrbitConnect::ConnectionAttempt", dependent: :destroy

    enum :status,
         {
           pending: "pending",
           connected: "connected",
           syncing: "syncing",
           disconnected: "disconnected",
           error: "error",
           revoking: "revoking"
         },
         default: "pending",
         validate: true

    validates :provider_key, :auth_strategy, presence: true

    before_validation :populate_auth_strategy, on: :create

    scope :active, -> { where(status: %w[connected syncing]) }
    scope :refreshable, -> { joins(:credential).merge(Credential.refreshable) }

    def provider_class
      OrbitConnect.provider_class(provider_key)
    end

    def provider
      provider_class.new(connection: self, provider_app: provider_app)
    end

    def expiring_soon?(window_seconds = OrbitConnect.config.token_refresh_window_seconds)
      credential&.access_token_expires_at.present? &&
        credential.access_token_expires_at <= window_seconds.to_i.seconds.from_now
    end

    private

    def populate_auth_strategy
      self.auth_strategy ||= provider_class.auth_strategy_key.to_s
    rescue OrbitConnect::ProviderNotFound
      self.auth_strategy ||= auth_strategy.presence || "unknown"
    end
  end
end
