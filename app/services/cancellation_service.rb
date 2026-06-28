class CancellationService
  Result = Struct.new(:success?, :booking, :error, keyword_init: true)

  def initialize(booking:)
    @booking = booking
  end

  def call
    validate_cancellation!

    ActiveRecord::Base.transaction do
      @booking.event.with_lock do
        @booking.cancel!
      end
    end

    Result.new(success?: true, booking: @booking, error: nil)

  rescue AlreadyCancelledError => e
    Result.new(success?: false, booking: nil, error: e.message)
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success?: false, booking: nil, error: e.record.errors.full_messages.join(", "))
  end

  private

  def validate_cancellation!
    if @booking.status == "cancelled"
      raise AlreadyCancelledError, "This booking has already been cancelled"
    end
  end

  class AlreadyCancelledError < StandardError; end
end
