# frozen_string_literal: true

Rails.application.config.x.orbit_ai = ActiveSupport::OrderedOptions.new
Rails.application.config.x.orbit_ai.base_url = ENV.fetch("ORBIT_AI_BASE_URL", ENV.fetch("ORBIT_AI_GATEWAY_URL", "http://localhost:8000"))
Rails.application.config.x.orbit_ai.secret_key = ENV.fetch("ORBIT_AI_SECRET_KEY", ENV.fetch("ORBIT_AI_SERVICE_TOKEN", "change-me"))
Rails.application.config.x.orbit_ai.timeout = ENV.fetch("ORBIT_AI_TIMEOUT", ENV.fetch("ORBIT_AI_GATEWAY_TIMEOUT", 180)).to_i
Rails.application.config.x.orbit_ai.enabled = ActiveModel::Type::Boolean.new.cast(ENV.fetch("ORBIT_AI_ENABLED", "true"))
Rails.application.config.x.orbit_ai.cf_access_client_id = ENV["ORBIT_AI_CF_ACCESS_CLIENT_ID"]
Rails.application.config.x.orbit_ai.cf_access_client_secret = ENV["ORBIT_AI_CF_ACCESS_CLIENT_SECRET"]
