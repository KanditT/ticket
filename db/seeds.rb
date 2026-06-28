puts "Seeding events..."

Event.find_or_create_by!(name: "Tech Conference 2026") do |event|
  event.description = "Latest trends in software development and AI"
  event.venue = "Convention Center Downtown"
  event.event_date = 1.month.from_now
  event.capacity = 300
end


Event.find_or_create_by!(name: "TEST") do |event|
  event.description = "TEST DESCRIPTION"
  event.venue = "TEST VENUE"
  event.event_date = 3.days.from_now
  event.capacity = 100
end

puts "Created #{Event.count} events"
