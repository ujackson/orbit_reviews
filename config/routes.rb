Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "workspace#home"

  # Authentication routes
  get "login", to: "auth#login", export: true
  get "callback", to: "auth#callback"
  get "logout", to: "auth#logout", export: true

  # WorkOS webhooks
  post "webhooks/workos", to: "webhooks#workos"

  defaults export: true do
    # Setup flow
    get "/setup", to: redirect("/setup/workspace"), as: :setup
    get "/setup/:step", to: "setup#show", constraints: { step: /workspace|team|channels|complete/ }, as: :setup_step
    patch "/setup", to: "setup#update"

    get "/w/:workspace_id", to: redirect("/w/%{workspace_id}/inbox/all"), as: :workspace
    get "/w/:workspace_id/inbox/:view_id", to: "workspace#inbox", as: :workspace_inbox
    get "/w/:workspace_id/contacts", to: "workspace#contacts", as: :workspace_contacts
    get "/w/:workspace_id/rules", to: "workspace#rules", as: :workspace_rules
    get "/w/:workspace_id/settings", to: "workspace#settings", as: :workspace_settings

    # Integrations
    scope "/w/:workspace_id" do
      get "/integrations", to: "integrations#index", as: :workspace_integrations
      post "/integrations/:provider_key/connect", to: "integrations#connect", as: :connect_integration
      post "/integrations/:provider_key/provider_app", to: "integrations#provider_app", as: :configure_integration_provider_app
      post "/integrations/:provider_key/credentials", to: "integrations#credentials", as: :submit_integration_credentials
      delete "/integrations/connections/:id", to: "integrations#disconnect", as: :disconnect_integration
      post "/integrations/connections/:id/sync", to: "integrations#sync", as: :sync_integration

      namespace :api do
        get "/conversations", to: "conversations#index"
        patch "/conversations/:id", to: "conversations#update"
        get "/conversations/:id/messages", to: "conversations#messages"
        post "/conversations/:id/reply", to: "conversations#reply"
        get "/conversations/:conversation_id/ai", to: "conversation_ai#show"
        post "/conversations/:conversation_id/ai/analyze", to: "conversation_ai#analyze"
        post "/conversations/:conversation_id/rag/index", to: "conversation_rag#index"
        post "/conversations/:conversation_id/rag/query", to: "conversation_rag#query"
        post "/rag/query", to: "rag#query"
        patch "/messages/:id", to: "messages#update"
      end
    end
  end

  scope "/workspaces/:workspace_id" do
    get "/conversations/:conversation_id/ai", to: "api/conversation_ai#show"
    post "/conversations/:conversation_id/ai/analyze", to: "api/conversation_ai#analyze"
    post "/conversations/:conversation_id/rag/index", to: "api/conversation_rag#index"
    post "/conversations/:conversation_id/rag/query", to: "api/conversation_rag#query"
    post "/rag/query", to: "api/rag#query"
  end

  # OAuth callback (outside workspace scope since provider redirects here)
  get "/integrations/oauth/:provider_key/callback", to: "integrations/oauth#callback", as: :integration_oauth_callback, export: true
  post "/integrations/gmail/pubsub", to: "integrations/gmail_pubsub#create", as: :gmail_pubsub_webhook

  mount OrbitConnect::Engine => "/orbit_connect"
end
