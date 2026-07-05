class CreateAiRuns < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_runs do |t|
      t.references :workspace, null: false, type: :uuid, foreign_key: true, index: false
      t.references :conversation, null: false, foreign_key: true, index: false
      t.integer :status, null: false, default: 0
      t.string :provider
      t.string :model
      t.datetime :started_at
      t.datetime :completed_at
      t.text :error_message
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :ai_runs, [:workspace_id, :conversation_id]
    add_index :ai_runs, [:workspace_id, :status]
    add_index :ai_runs, [:workspace_id, :created_at]
  end
end
