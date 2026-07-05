class AddWorkspaceToOrbitConnectConnectionAttempts < ActiveRecord::Migration[8.1]
  def up
    add_column :orbit_connect_connection_attempts, :workspace_id, :uuid
    add_index :orbit_connect_connection_attempts, :workspace_id
    add_foreign_key :orbit_connect_connection_attempts, :workspaces, column: :workspace_id

    execute <<~SQL.squish
      UPDATE orbit_connect_connection_attempts attempts
      SET workspace_id = connections.workspace_id
      FROM orbit_connect_connections connections
      WHERE attempts.connection_id = connections.id
    SQL

    change_column_null :orbit_connect_connection_attempts, :workspace_id, false
    remove_index :orbit_connect_connection_attempts, name: "index_orbit_connect_connection_attempts_on_owner"
    remove_column :orbit_connect_connection_attempts, :owner_type
    remove_column :orbit_connect_connection_attempts, :owner_id
  end

  def down
    add_reference :orbit_connect_connection_attempts, :owner, polymorphic: true, null: true

    execute <<~SQL.squish
      UPDATE orbit_connect_connection_attempts
      SET owner_type = 'Workspace'
      WHERE workspace_id IS NOT NULL
    SQL

    remove_foreign_key :orbit_connect_connection_attempts, :workspaces
    remove_index :orbit_connect_connection_attempts, :workspace_id
    remove_column :orbit_connect_connection_attempts, :workspace_id
  end
end
