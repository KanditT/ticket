# Event Ticketing System

A full-stack event ticketing application with Ruby on Rails backend and vanilla JavaScript frontend. Features real-time ticket availability tracking and robust concurrency handling to prevent overbooking.

## How to Run the Code

### Prerequisites

- Ruby 3.x
- Rails 8.0.5
- SQLite3

### Quick Start

```bash
# Install dependencies
bundle install
  # rbenv install 3.3.6 IF NOT INSTALL YET
  
  # Install PostgreSQL and dev headers (Debian/Ubuntu)
  sudo apt-get update
  sudo apt-get install -y postgresql postgresql-contrib libpq-dev

  # Start and enable service
  sudo systemctl start postgresql
  sudo systemctl enable postgresql

  # Create a DB role matching your Linux user so Rails can connect without credentials
  sudo -u postgres createuser -s $USER

# Set up database
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed  # Optional: creates sample events

# Start the server
bin/rails server -p 3000

# Open in browser
http://localhost:3000
```

### What You Can Do

- **Create events** - Add new events with venue, date, and capacity
- **Book tickets** - Select quantity and provide email (generates reference: `TKT-XXXXXX`)
- **Check bookings** - Search by reference number to view details
- **Cancel bookings** - Cancel confirmed bookings (tickets are restored)

## How Concurrency is Handled

**Problem:** Two users buying the last ticket simultaneously could cause overbooking.

**Solution:** Pessimistic locking with database transactions

```ruby
# app/services/booking_service.rb
ActiveRecord::Base.transaction do
  @event.with_lock do  # SELECT ... FOR UPDATE
    check_availability!
    booking = @event.bookings.create!(...)
  end
end
```

**How it works:**

1. `with_lock` acquires a row-level database lock on the event
2. If two users try to book simultaneously, requests are serialized (queued)
3. First request locks the event, checks availability, creates booking
4. Second request waits, then sees updated ticket count
5. If insufficient tickets remain, second request fails with clear error message

**Example scenario:**

- Event has 1 ticket left
- User A and User B both try to book 1 ticket at the same time
- User A's lock succeeds first → books the ticket (0 left)
- User B's request waits, then fails: "Only 0 ticket(s) available (1 requested)"
- **Result:** No overbooking, one happy customer, one informed customer

**Why pessimistic locking?**

- Simple and reliable for high-contention scenarios (popular events)
- Database-level guarantee prevents race conditions
- No risk of dirty reads or lost updates
- Works across multiple app servers (production-ready)

## If I Had More Time

### Short-term improvements (1-2 days)

**Email confirmations** - Send booking confirmations with PDF tickets
**Search and filters** - Filter events by date, venue, availability
**Error handling** - Better user feedback for validation errors
**User authentication** - Save booking history, manage multiple bookings
**Payment integration** - Stripe/PayPal for paid events
**QR code tickets** - Generate scannable tickets for entry
**Seat selection** - Interactive seating maps for venues
**Social features** - Share events, invite friends, see who's attending

### Technical improvements

- **Caching** - Redis for event listings and availability checks
- **Background jobs** - Sidekiq for email sending, ticket generation
- **Rate limiting** - Prevent abuse with rack-attack
- **API versioning** - Version API endpoints for backward compatibility
- **Comprehensive testing** - Full test coverage with RSpec, Capybara
- **Performance monitoring** - New Relic or Datadog for production insights

**Tech Stack:** Ruby on Rails 8.0.5 | Vanilla JavaScript | Tailwind CSS | SQLite

## Architecture

**Backend (Rails 8.0.5)**

- MVC pattern with Service Objects for business logic
- RESTful API with JSON responses
- SQLite (dev) / PostgreSQL-ready (production)

**Frontend (Vanilla JavaScript)**

- No frameworks - pure ES6+
- Tailwind CSS for styling
- CSRF protection for all POST/DELETE requests

**Key Files:**

- `app/services/booking_service.rb` - Booking logic with concurrency handling
- `app/services/cancellation_service.rb` - Cancellation logic
- `public/app.js` - Frontend application
- `app/models/event.rb` - Event model with availability calculations

## API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/events.json`              | List all upcoming events |
| POST   | `/events.json`              | Create new event         |
| POST   | `/events/:id/bookings.json` | Book tickets for event   |
| GET    | `/bookings/:reference.json` | Get booking by reference |
| DELETE | `/bookings/:reference`      | Cancel booking           |

## Database Schema

**Events:** `name`, `description`, `venue`, `event_date`, `capacity`

**Bookings:** `event_id`, `email`, `quantity`, `status` (confirmed/cancelled), `reference`

The `tickets_available` is calculated dynamically:

```ruby
def tickets_available
  capacity - bookings.confirmed.sum(:quantity)
end
```

This ensures real-time accuracy without storing redundant data.
