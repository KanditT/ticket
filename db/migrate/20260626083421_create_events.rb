class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.string   :name,       null: false
      t.text     :description
      t.datetime :event_date, null: false
      t.integer  :capacity,   null: false
      t.string   :venue,      null: false
      t.timestamps
    end
    add_index :events, :event_date
  end
end
