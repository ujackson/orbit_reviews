# This migration comes from orbit_connect (originally 20260418000100)
class CreateOrbitConnectProviderApps < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_provider_apps do |t|
      t.string :provider_key, null: false
      t.string :name, null: false
      t.string :environment, null: false
      t.references :owner, polymorphic: true, null: true, type: :uuid
      t.string :client_id
      t.text :client_secret
      t.text :webhook_signing_secret
      t.boolean :active, null: false, default: true
      t.jsonb :scopes, null: false, default: []
      t.jsonb :config, null: false, default: {}
      t.timestamps
    end

    add_index :orbit_connect_provider_apps, [:provider_key, :environment]
    add_index :orbit_connect_provider_apps, [:provider_key, :owner_type, :owner_id, :environment], name: "idx_orbit_connect_apps_owner_env"
  end
end
