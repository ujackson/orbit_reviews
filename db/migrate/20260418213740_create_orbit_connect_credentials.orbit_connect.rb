# This migration comes from orbit_connect (originally 20260418000300)
class CreateOrbitConnectCredentials < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_credentials do |t|
      t.references :connection, null: false, foreign_key: { to_table: :orbit_connect_connections }, index: { unique: true }
      t.string :credential_type, null: false
      t.text :access_token
      t.text :refresh_token
      t.text :api_key
      t.text :password
      t.text :secret
      t.datetime :access_token_expires_at
      t.jsonb :scopes, null: false, default: []
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end
  end
end
