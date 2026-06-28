class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :event,    null: false, foreign_key: true
      t.string  :email,       null: false
      t.integer :quantity,    null: false
      t.string  :status,      null: false, default: "confirmed"
      t.string  :reference,   null: false
      t.timestamps
    end
    add_index :bookings, :reference, unique: true
    add_index :bookings, :email
    add_index :bookings, :status
  end
end
