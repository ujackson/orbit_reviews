require "rails/generators"
require "rails/generators/migration"

module OrbitConnect
  module Generators
    class InstallGenerator < Rails::Generators::Base
      include Rails::Generators::Migration

      source_root File.expand_path("templates", __dir__)

      desc "Installs OrbitConnect initializer and migrations."

      def copy_initializer
        template "orbit_connect_initializer.rb", "config/initializers/orbit_connect.rb"
      end

      def copy_migrations
        rake "orbit_connect:install:migrations"
      end

      def show_readme
        say <<~MSG
          OrbitConnect installed.

          Next steps:
            1. Mount the engine in config/routes.rb
            2. Run: bin/rails db:migrate
            3. Configure Active Record Encryption in the host app
            4. Add recurring jobs for token refresh / health sweeps
        MSG
      end

      def self.next_migration_number(_dirname)
        Time.now.utc.strftime("%Y%m%d%H%M%S")
      end
    end
  end
end
