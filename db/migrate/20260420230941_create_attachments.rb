class CreateAttachments < ActiveRecord::Migration[8.1]
  def change
    create_table :attachments do |t|
      t.bigint :message_id, null: false
      t.string :external_id
      t.string :filename, null: false
      t.string :mime_type
      t.integer :attachment_type, default: 5
      t.integer :size, default: 0
      t.string :download_url
      t.string :source
      t.text :ai_summary
      t.jsonb :ai_extracted_fields
      t.text :ai_description

      t.timestamps
    end

    add_index :attachments, :message_id
    add_index :attachments, [:external_id, :message_id], unique: true, name: 'index_attachments_on_external_id_and_message'
    add_foreign_key :attachments, :messages
  end
end
