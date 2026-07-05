module OrbitConnect
  class Engine < ::Rails::Engine
    isolate_namespace OrbitConnect

    config.generators.api_only = false

    paths.add "app/services", eager_load: true
    paths.add "app/clients", eager_load: true
    paths.add "app/providers", eager_load: true
    paths.add "app/auth_strategies", eager_load: true
    paths.add "app/sync", eager_load: true
    paths.add "app/webhooks", eager_load: true

    initializer "orbit_connect.register_built_ins" do
      config.to_prepare do
        OrbitConnect::BuiltInProviders.register!
      end
    end
  end
end
