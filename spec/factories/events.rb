FactoryBot.define do
  factory :event do
    sequence(:name) { |n| "Concert #{n}" }
    description { "An amazing show." }
    venue       { "The Grand Venue" }
    event_date  { 2.weeks.from_now }
    capacity    { 100 }
  end
end
