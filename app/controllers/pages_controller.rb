class PagesController < ActionController::Base
  protect_from_forgery with: :exception

  def index
    # Serves the frontend
  end
end
