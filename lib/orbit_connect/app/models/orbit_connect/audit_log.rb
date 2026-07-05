module OrbitConnect
  class AuditLog < ApplicationRecord
    self.table_name = "orbit_connect_audit_logs"

    belongs_to :connection, class_name: "OrbitConnect::Connection", optional: true
    belongs_to :actor, polymorphic: true, optional: true

    validates :action, :provider_key, presence: true
  end
end
