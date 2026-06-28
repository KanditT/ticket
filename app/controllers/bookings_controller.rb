class BookingsController < ApplicationController
  def create
    event = Event.find(params[:event_id])

    result = BookingService.new(
      event:    event,
      email:    booking_params[:email],
      quantity: booking_params[:quantity]
    ).call

    if result.success?
      render json: serialize_booking(result.booking), status: :created
    else
      render_errors(result.error)
    end
  end

  def show
    event   = Event.find(params[:event_id])
    booking = event.bookings.find(params[:id])
    render json: serialize_booking(booking)
  end

  def show_by_reference
    booking = Booking.find_by!(reference: params[:reference].upcase)
    render json: serialize_booking(booking)
  end

  def destroy
    booking = Booking.find_by!(reference: params[:reference].upcase)

    result = CancellationService.new(booking: booking).call

    if result.success?
      render json: serialize_booking(result.booking), status: :ok
    else
      render_errors(result.error)
    end
  end

  private

  def booking_params
    params.require(:booking).permit(:email, :quantity)
  end

  def serialize_booking(booking)
    {
      id:        booking.id,
      reference: booking.reference,
      event_id:  booking.event_id,
      email:     booking.email,
      quantity:  booking.quantity,
      status:    booking.status,
      booked_at: booking.created_at.iso8601
    }
  end
end
