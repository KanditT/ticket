class Booking < ApplicationRecord
  belongs_to :event

  STATUSES = %w[confirmed cancelled].freeze

  before_validation :assign_reference, on: :create

  validates :email,     presence: true,
                        format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :quantity,  numericality: { only_integer: true, greater_than: 0 }
  validates :status,    inclusion: { in: STATUSES }
  validates :reference, presence: true, uniqueness: true

  scope :confirmed, -> { where(status: "confirmed") }

  def cancel!
    update!(status: "cancelled")
  end

  private

  def assign_reference
    self.reference ||= generate_reference
  end

  def generate_reference
    loop do
      ref = "TKT-#{SecureRandom.alphanumeric(6).upcase}"
      break ref unless Booking.exists?(reference: ref)
    end
  end
end
