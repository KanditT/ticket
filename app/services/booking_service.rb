class BookingService
  Result = Struct.new(:success?, :booking, :error, keyword_init: true)

  def initialize(event:, email:, quantity:)
    @event    = event
    @email    = email
    @quantity = quantity.to_i
  end

  def call
    validate_input!
    booking = nil

    ActiveRecord::Base.transaction do
      @event.with_lock do
        check_availability!
        booking = @event.bookings.create!(
          email:    @email,
          quantity: @quantity,
          status:   "confirmed"
        )
      end
    end

    Result.new(success?: true, booking: booking, error: nil)

  rescue InsufficientTicketsError => e
    Result.new(success?: false, booking: nil, error: e.message)
  rescue ArgumentError => e
    Result.new(success?: false, booking: nil, error: e.message)
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success?: false, booking: nil, error: e.record.errors.full_messages.join(", "))
  end

  private

  def validate_input!
    raise ArgumentError, "Quantity must be at least 1" if @quantity < 1
    raise ArgumentError, "Invalid email address" unless valid_email?(@email)
  end

  def check_availability!
    available = @event.tickets_available
    if available < @quantity
      raise InsufficientTicketsError,
        "Only #{available} ticket(s) available (#{@quantity} requested)"
    end
  end

  def valid_email?(email)
    email.to_s.match?(URI::MailTo::EMAIL_REGEXP)
  end

  class InsufficientTicketsError < StandardError; end
end
