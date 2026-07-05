Rails.application.config.auth = {
  provider: (ENV["AUTH_PROVIDER"] || "workos").to_sym,
  session_cookie: ENV.fetch("AUTH_SESSION_COOKIE", "app_session"),

  workos: {
    client_id: ENV.fetch("WORKOS_CLIENT_ID", nil),
    api_key: ENV.fetch("WORKOS_API_KEY", nil),
    redirect_url: ENV.fetch("WORKOS_REDIRECT_URL", nil),
    cookie_password: ENV.fetch("WORKOS_COOKIE_PASSWORD", nil),
    provider: ENV.fetch("WORKOS_PROVIDER", "authkit")
  }
}
