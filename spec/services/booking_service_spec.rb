require 'rails_helper'

RSpec.describe BookingService do
  describe "#call" do
    let(:event) { create(:event, capacity: 10) }
    let(:email) { "test@example.com" }

    def call(quantity:, email: "test@example.com")
      BookingService.new(event: event, email: email, quantity: quantity).call
    end

    it "returns an unsuccessful result when not enough tickets remain" do
      create(:booking, event: event, quantity: 9)  # 1 left
      result = call(quantity: 2)
      expect(result.success?).to be false
      expect(result.error).to match(/only 1 ticket/i)
    end
  end
end
