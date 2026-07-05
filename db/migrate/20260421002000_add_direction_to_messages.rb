class AddDirectionToMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :messages, :direction, :integer, null: false, default: 0
    add_index :messages, :direction
  end
end
