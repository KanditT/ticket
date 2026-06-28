require 'rails_helper'

RSpec.describe Event, type: :model do
  describe "#tickets_sold" do
    let(:event) { create(:event, capacity: 100) }

    it "counts only confirmed bookings" do
      create(:booking, event: event, quantity: 10, status: "confirmed")
      create(:booking, event: event, quantity: 5,  status: "cancelled")
      expect(event.tickets_sold).to eq(10)
    end
  end
end
