class CreateAiArtifacts < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_artifacts do |t|
      t.references :workspace, null: false, type: :uuid, foreign_key: true, index: false
      t.references :conversation, null: false, foreign_key: true, index: false
      t.references :ai_run, null: false, foreign_key: true, index: false
      t.string :artifact_type, null: false
      t.jsonb :payload, null: false, default: {}
      t.string :provider
      t.string :model
      t.float :confidence
      t.datetime :generated_at
      t.boolean :stale, null: false, default: false
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :ai_artifacts, [:workspace_id, :conversation_id, :artifact_type], name: "idx_ai_artifacts_workspace_conversation_type"
    add_index :ai_artifacts, [:workspace_id, :conversation_id, :created_at], name: "idx_ai_artifacts_workspace_conversation_created"
    add_index :ai_artifacts, [:workspace_id, :stale]
  end
end
