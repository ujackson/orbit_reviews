# This migration comes from orbit_connect (originally 20260418000700)
class CreateOrbitConnectAuditLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_audit_logs do |t|
      t.references :connection, null: true, foreign_key: { to_table: :orbit_connect_connections }
      t.references :actor, polymorphic: true, null: true
      t.string :provider_key, null: false
      t.string :action, null: false
      t.jsonb :data, null: false, default: {}
      t.timestamps
    end

    add_index :orbit_connect_audit_logs, [:provider_key, :action], name: "idx_orbit_connect_audit_logs_action"
  end
end
