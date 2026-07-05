OrbitConnect::Engine.routes.draw do
  get "oauth/:provider/callback", to: "oauth#callback", as: :oauth_callback
  post "webhooks/:provider", to: "webhooks#create", as: :webhook
  post "webhooks/:provider/:connection_id", to: "webhooks#create", as: :scoped_webhook
end
