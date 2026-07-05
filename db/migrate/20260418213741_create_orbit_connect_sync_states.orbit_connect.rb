# This migration comes from orbit_connect (originally 20260418000400)
class CreateOrbitConnectSyncStates < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_sync_states do |t|
      t.references :connection, null: false, foreign_key: { to_table: :orbit_connect_connections }
      t.string :resource_name, null: false
      t.string :cursor
      t.datetime :checkpoint_at
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :orbit_connect_sync_states, [:connection_id, :resource_name], unique: true, name: "idx_orbit_connect_sync_states_unique"
  end
end
