ENV["RAILS_ENV"] ||= "test"

require "bundler/setup"
require "rails"
require "active_record"
require "active_job"
require "minitest/autorun"
require "orbit_connect"

class DummyApp < Rails::Application
  config.secret_key_base = "a" * 128
  config.eager_load = false
end
