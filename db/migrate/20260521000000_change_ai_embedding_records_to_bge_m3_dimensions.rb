# frozen_string_literal: true

class ChangeAiEmbeddingRecordsToBgeM3Dimensions < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL.squish
      UPDATE ai_embedding_records
      SET embedding = NULL,
          metadata = jsonb_set(
            jsonb_set(metadata, '{embedding_status}', '"dimension_migrated"', true),
            '{embedding_error}',
            '"Existing vectors were cleared for BAAI/bge-m3 1024-dimensional re-embedding."',
            true
          )
      WHERE embedding IS NOT NULL
    SQL

    change_column :ai_embedding_records, :embedding, :vector, limit: 1024
  end

  def down
    execute <<~SQL.squish
      UPDATE ai_embedding_records
      SET embedding = NULL,
          metadata = jsonb_set(
            jsonb_set(metadata, '{embedding_status}', '"dimension_migrated"', true),
            '{embedding_error}',
            '"Existing vectors were cleared for 768-dimensional rollback."',
            true
          )
      WHERE embedding IS NOT NULL
    SQL

    change_column :ai_embedding_records, :embedding, :vector, limit: 768
  end
end
