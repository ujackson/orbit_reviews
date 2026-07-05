class CreateConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :conversations do |t|
      t.uuid :workspace_id, null: false
      t.string :external_id, null: false
      t.string :external_source, null: false
      t.string :subject
      t.text :preview
      t.integer :channel, default: 0
      t.integer :status, default: 0
      t.integer :priority, default: 0
      t.bigint :sender_id
      t.jsonb :labels, default: []
      t.datetime :last_message_at
      t.integer :unread_count, default: 0
      t.text :ai_summary
      t.jsonb :metadata

      t.timestamps
    end

    add_index :conversations, :workspace_id
    add_index :conversations, [:external_id, :external_source, :workspace_id], unique: true, name: 'index_conversations_on_external_id_and_source_and_workspace'
    add_index :conversations, :status
    add_index :conversations, :channel
    add_index :conversations, :last_message_at
    add_foreign_key :conversations, :workspaces
  end
end
