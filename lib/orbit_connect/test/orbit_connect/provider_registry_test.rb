require "test_helper"

class OrbitConnectProviderRegistryTest < Minitest::Test
  def setup
    OrbitConnect.reset!
  end

  def test_register_and_fetch
    klass = Class.new(OrbitConnect::Providers::Base) do
      self.provider_key = :demo
      self.display_name = "Demo"
      self.auth_strategy_class = OrbitConnect::AuthStrategies::ApiKey
      self.client_class = OrbitConnect::Clients::GenericApiClient
      self.sync_class = OrbitConnect::Sync::GenericPullSync
    end

    OrbitConnect.registry.register(klass)

    assert_equal klass, OrbitConnect.provider_class(:demo)
  end
end
