# frozen_string_literal: true

class CreateAiEmbeddingRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_embedding_records do |t|
      t.references :workspace, null: false, foreign_key: true, type: :uuid
      t.string :user_id
      t.string :content_type, null: false
      t.string :content_id, null: false
      t.string :title
      t.text :content
      t.vector :embedding, limit: 768
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :ai_embedding_records,
      [ :workspace_id, :content_type, :content_id ],
      name: "idx_ai_embeddings_workspace_content"

    add_index :ai_embedding_records, [ :workspace_id, :user_id ]
    add_index :ai_embedding_records, [ :workspace_id, :created_at ]
  end
end
