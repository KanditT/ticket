class EventsController < ApplicationController
  def index
    events = Event.upcoming.includes(:bookings)
    render json: events.map { |e| serialize_event(e) }
  end

  def show
    event = Event.find(params[:id])
    render json: serialize_event(event)
  end

  def create
    event = Event.new(event_params)

    if event.save
      render json: serialize_event(event), status: :created
    else
      render_errors(event.errors.full_messages.join(", "))
    end
  end

  private

  def event_params
    params.require(:event).permit(:name, :description, :venue, :event_date, :capacity)
  end

  def serialize_event(event)
    {
      id:                event.id,
      name:              event.name,
      description:       event.description,
      venue:             event.venue,
      event_date:        event.event_date.iso8601,
      capacity:          event.capacity,
      tickets_available: event.tickets_available,
      tickets_sold:      event.tickets_sold,
      sold_out:          event.sold_out?
    }
  end
end
