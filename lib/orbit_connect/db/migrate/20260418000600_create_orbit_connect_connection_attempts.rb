class CreateOrbitConnectConnectionAttempts < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_connection_attempts do |t|
      t.references :connection, null: false, foreign_key: { to_table: :orbit_connect_connections }
      t.references :owner, polymorphic: true, null: false
      t.references :initiator, polymorphic: true, null: true
      t.references :provider_app, null: true, foreign_key: { to_table: :orbit_connect_provider_apps }
      t.string :provider_key, null: false
      t.string :status, null: false, default: "pending"
      t.string :state_nonce, null: false
      t.text :pkce_verifier
      t.string :return_to
      t.datetime :expires_at, null: false
      t.jsonb :requested_scopes, null: false, default: []
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :orbit_connect_connection_attempts, :status
  end
end
