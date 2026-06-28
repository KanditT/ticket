class ApplicationController < ActionController::API
  # Include CSRF protection for non-API requests (like from the web frontend)
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :null_session

  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def not_found
    render json: { error: "Resource not found" }, status: :not_found
  end

  def render_errors(messages, status: :unprocessable_entity)
    render json: { error: messages }, status: status
  end
end
