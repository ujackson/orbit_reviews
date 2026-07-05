class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.bigint :conversation_id, null: false
      t.string :external_id, null: false
      t.string :external_source
      t.bigint :sender_id, null: false
      t.integer :channel, default: 0
      t.string :subject
      t.text :body
      t.text :preview
      t.datetime :timestamp
      t.integer :status, default: 0
      t.integer :priority, default: 0
      t.jsonb :labels, default: []
      t.boolean :has_attachments, default: false
      t.text :ai_summary
      t.jsonb :metadata

      t.timestamps
    end

    add_index :messages, :conversation_id
    add_index :messages, [:external_id, :conversation_id], unique: true, name: 'index_messages_on_external_id_and_conversation'
    add_index :messages, :sender_id
    add_index :messages, :timestamp
    add_index :messages, :status
    add_foreign_key :messages, :conversations
  end
end
