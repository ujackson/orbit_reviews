module OrbitConnect
  class SyncState < ApplicationRecord
    self.table_name = "orbit_connect_sync_states"

    belongs_to :connection, class_name: "OrbitConnect::Connection"

    validates :resource_name, presence: true
  end
end
