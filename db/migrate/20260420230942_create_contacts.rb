class CreateContacts < ActiveRecord::Migration[8.1]
  def change
    create_table :contacts do |t|
      t.uuid :workspace_id, null: false
      t.string :email, null: false
      t.string :name
      t.string :avatar_url
      t.string :organization
      t.string :external_id

      t.timestamps
    end

    add_index :contacts, [:workspace_id, :email], unique: true, name: 'index_contacts_on_workspace_and_email'
    add_foreign_key :contacts, :workspaces
  end
end
