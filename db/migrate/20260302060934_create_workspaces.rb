class CreateWorkspaces < ActiveRecord::Migration[8.1]
  def change
    create_table :workspaces, id: :uuid do |t|
      t.string :remote_id, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
