# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding events..."

Event.find_or_create_by!(name: "Summer Music Festival") do |event|
  event.description = "An amazing outdoor music festival featuring top artists"
  event.venue = "Central Park Amphitheater"
  event.event_date = 2.weeks.from_now
  event.capacity = 500
end

Event.find_or_create_by!(name: "Tech Conference 2026") do |event|
  event.description = "Latest trends in software development and AI"
  event.venue = "Convention Center Downtown"
  event.event_date = 1.month.from_now
  event.capacity = 300
end

Event.find_or_create_by!(name: "Comedy Night") do |event|
  event.description = "Stand-up comedy with local comedians"
  event.venue = "Laugh Factory"
  event.event_date = 1.week.from_now
  event.capacity = 150
end

Event.find_or_create_by!(name: "Art Gallery Opening") do |event|
  event.description = "Contemporary art exhibition opening night"
  event.venue = "Modern Art Museum"
  event.event_date = 3.days.from_now
  event.capacity = 100
end

puts "Created #{Event.count} events"
