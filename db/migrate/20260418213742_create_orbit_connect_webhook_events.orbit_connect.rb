# This migration comes from orbit_connect (originally 20260418000500)
class CreateOrbitConnectWebhookEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :orbit_connect_webhook_events do |t|
      t.string :provider_key, null: false
      t.references :connection, null: true, foreign_key: { to_table: :orbit_connect_connections }
      t.string :event_uid, null: false
      t.string :event_type
      t.string :status, null: false, default: "received"
      t.jsonb :headers, null: false, default: {}
      t.jsonb :payload, null: false, default: {}
      t.string :signature
      t.integer :attempt_count, null: false, default: 0
      t.text :last_error
      t.datetime :received_at
      t.datetime :processed_at
      t.timestamps
    end

    add_index :orbit_connect_webhook_events, [:provider_key, :event_uid], unique: true, name: "idx_orbit_connect_webhooks_uid"
    add_index :orbit_connect_webhook_events, :status
  end
end
