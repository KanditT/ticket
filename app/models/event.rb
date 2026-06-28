class Event < ApplicationRecord
  has_many :bookings, dependent: :destroy

  validates :name,       presence: true
  validates :event_date, presence: true
  validates :capacity,   presence: true,
                         numericality: { greater_than: 0 }
  validates :venue,      presence: true

  scope :upcoming, -> { where("event_date >= ?", Time.current).order(:event_date) }

  def tickets_sold
    bookings.confirmed.sum(:quantity)
  end

  def tickets_available
    capacity - tickets_sold
  end

  def sold_out?
    tickets_available <= 0
  end
end
