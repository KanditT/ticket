Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.

  resources :events, only: %i[index show create] do
    resources :bookings, only: %i[create show]
  end

  get "/bookings/:reference", to: "bookings#show_by_reference"
  delete "/bookings/:reference", to: "bookings#destroy"
  get "/up", to: proc { [ 200, {}, [ "OK" ] ] }

  # Frontend
  root "pages#index"
end
