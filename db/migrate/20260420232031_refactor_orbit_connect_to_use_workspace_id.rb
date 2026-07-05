class RefactorOrbitConnectToUseWorkspaceId < ActiveRecord::Migration[8.1]
  def up
    # Add workspace_id to orbit_connect_connections
    add_column :orbit_connect_connections, :workspace_id, :uuid
    add_index :orbit_connect_connections, :workspace_id
    add_foreign_key :orbit_connect_connections, :workspaces, column: :workspace_id

    # Migrate data from polymorphic owner to workspace_id (owner_id is now UUID)
    execute <<-SQL
      UPDATE orbit_connect_connections
      SET workspace_id = owner_id
      WHERE owner_type = 'Workspace'
    SQL

    # Make workspace_id not null after data migration
    change_column_null :orbit_connect_connections, :workspace_id, false

    # Remove old polymorphic columns
    remove_index :orbit_connect_connections, name: "idx_orbit_connect_connections_owner"
    remove_column :orbit_connect_connections, :owner_type
    remove_column :orbit_connect_connections, :owner_id

    # Update index to use workspace_id
    add_index :orbit_connect_connections, [:provider_key, :workspace_id], name: "idx_orbit_connect_connections_workspace"

    # Add workspace_id to orbit_connect_provider_apps (workspace-specific OAuth apps)
    add_column :orbit_connect_provider_apps, :workspace_id, :uuid
    add_index :orbit_connect_provider_apps, :workspace_id
    add_foreign_key :orbit_connect_provider_apps, :workspaces, column: :workspace_id

    # Migrate existing provider apps (owner_id is now UUID)
    execute <<-SQL
      UPDATE orbit_connect_provider_apps
      SET workspace_id = owner_id
      WHERE owner_type = 'Workspace'
    SQL

    # Remove old polymorphic columns from provider_apps
    remove_index :orbit_connect_provider_apps, name: "idx_orbit_connect_apps_owner_env"
    remove_column :orbit_connect_provider_apps, :owner_type
    remove_column :orbit_connect_provider_apps, :owner_id

    # Update index to use workspace_id (null workspace_id = global app)
    add_index :orbit_connect_provider_apps, [:provider_key, :workspace_id, :environment],
              name: "idx_orbit_connect_apps_workspace_env"
  end

  def down
    # Revert orbit_connect_connections
    add_column :orbit_connect_connections, :owner_type, :string
    add_column :orbit_connect_connections, :owner_id, :uuid

    execute <<-SQL
      UPDATE orbit_connect_connections
      SET owner_type = 'Workspace', owner_id = workspace_id
      WHERE workspace_id IS NOT NULL
    SQL

    change_column_null :orbit_connect_connections, :owner_type, false
    change_column_null :orbit_connect_connections, :owner_id, false

    add_index :orbit_connect_connections, [:provider_key, :owner_type, :owner_id],
              name: "idx_orbit_connect_connections_owner"
    remove_index :orbit_connect_connections, name: "idx_orbit_connect_connections_workspace"
    remove_foreign_key :orbit_connect_connections, :workspaces
    remove_column :orbit_connect_connections, :workspace_id

    # Revert orbit_connect_provider_apps
    add_column :orbit_connect_provider_apps, :owner_type, :string
    add_column :orbit_connect_provider_apps, :owner_id, :uuid

    execute <<-SQL
      UPDATE orbit_connect_provider_apps
      SET owner_type = 'Workspace', owner_id = workspace_id
      WHERE workspace_id IS NOT NULL
    SQL

    add_index :orbit_connect_provider_apps, [:provider_key, :owner_type, :owner_id, :environment],
              name: "idx_orbit_connect_apps_owner_env"
    remove_index :orbit_connect_provider_apps, name: "idx_orbit_connect_apps_workspace_env"
    remove_foreign_key :orbit_connect_provider_apps, :workspaces
    remove_column :orbit_connect_provider_apps, :workspace_id
  end
end
