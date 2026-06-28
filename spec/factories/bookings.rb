FactoryBot.define do
  factory :booking do
    event
    sequence(:email) { |n| "user#{n}@example.com" }
    quantity { 2 }
    status   { "confirmed" }
  end
end
