Rails.application.routes.draw do
  mount OrbitConnect::Engine => "/orbit_connect"

  resources :integrations, only: [:index] do
    member do
      get :connect
      post :credentials
    end
  end
end
