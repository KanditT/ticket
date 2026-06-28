require 'rails_helper'

RSpec.describe "Bookings API", type: :request do
  describe "POST /events/:event_id/bookings" do
    let(:event) { create(:event, capacity: 50) }

    def post_booking(quantity:, email: "test@example.com")
      post "/events/#{event.id}/bookings.json", params: {
        booking: { email: email, quantity: quantity }
      }, as: :json
    end

    it "returns 422 when not enough tickets remain" do
      create(:booking, event: event, quantity: 49)
      post_booking(quantity: 2)
      expect(response).to have_http_status(422)
    end
  end
end
