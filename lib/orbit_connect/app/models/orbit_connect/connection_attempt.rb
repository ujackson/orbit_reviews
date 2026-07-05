module OrbitConnect
  class ConnectionAttempt < ApplicationRecord
    self.table_name = "orbit_connect_connection_attempts"

    belongs_to :connection, class_name: "OrbitConnect::Connection"
    belongs_to :workspace, class_name: "Workspace"
    belongs_to :initiator, polymorphic: true, optional: true
    belongs_to :provider_app, class_name: "OrbitConnect::ProviderApp", optional: true

    encrypts :pkce_verifier

    enum :status,
         {
           pending: "pending",
           completed: "completed",
           expired: "expired",
           cancelled: "cancelled"
         },
         default: "pending",
         validate: true

    validates :provider_key, :state_nonce, :expires_at, presence: true

    def expired?
      expires_at <= Time.current
    end
  end
end
