# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_06_26_083422) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "bookings", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.string "email", null: false
    t.integer "quantity", null: false
    t.string "status", default: "confirmed", null: false
    t.string "reference", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_bookings_on_email"
    t.index ["event_id"], name: "index_bookings_on_event_id"
    t.index ["reference"], name: "index_bookings_on_reference", unique: true
    t.index ["status"], name: "index_bookings_on_status"
  end

  create_table "events", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.datetime "event_date", null: false
    t.integer "capacity", null: false
    t.string "venue", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_date"], name: "index_events_on_event_date"
  end

  add_foreign_key "bookings", "events"
end
