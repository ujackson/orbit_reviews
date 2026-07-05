class CreateOrbitConnectConnections < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_connections do |t|
      t.string :provider_key, null: false
      t.string :auth_strategy, null: false
      t.references :owner, polymorphic: true, null: false, type: :uuid
      t.references :initiator, polymorphic: true, null: true, type: :uuid
      t.references :provider_app, null: true, foreign_key: { to_table: :orbit_connect_provider_apps }
      t.string :status, null: false, default: "pending"
      t.string :external_account_id
      t.string :external_name
      t.datetime :last_synced_at
      t.datetime :last_tested_at
      t.datetime :last_webhook_at
      t.datetime :disconnected_at
      t.integer :failure_count, null: false, default: 0
      t.datetime :next_sync_at
      t.string :health_status
      t.jsonb :health_payload, null: false, default: {}
      t.jsonb :settings, null: false, default: {}
      t.jsonb :auth_metadata, null: false, default: {}
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end

    add_index :orbit_connect_connections, [:provider_key, :owner_type, :owner_id], name: "idx_orbit_connect_connections_owner"
    add_index :orbit_connect_connections, [:provider_key, :external_account_id], name: "idx_orbit_connect_connections_external_account"
    add_index :orbit_connect_connections, :status
  end
end
