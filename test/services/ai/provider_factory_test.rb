require "test_helper"

class AiProviderFactoryTest < ActiveSupport::TestCase
  test "builds fast api provider when configured" do
    with_env("ORBIT_AI_PROVIDER" => "fast_api") do
      assert_instance_of Ai::Providers::FastApiProvider, Ai::ProviderFactory.build
    end
  end

  test "defaults to fast api outside test" do
    with_env("ORBIT_AI_PROVIDER" => nil) do
      with_singleton_stub(Rails.env, :test?, false) do
        assert_instance_of Ai::Providers::FastApiProvider, Ai::ProviderFactory.build
      end
    end
  end

  test "ruby llm provider is not supported" do
    with_env("ORBIT_AI_PROVIDER" => "ruby_llm") do
      error = assert_raises(Ai::ProviderError) { Ai::ProviderFactory.build }
      assert_match "Unsupported AI provider", error.message
    end
  end

  private

  def with_env(values)
    previous = values.keys.index_with { |key| ENV[key] }
    values.each { |key, value| ENV[key] = value }
    yield
  ensure
    previous.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
  end
end
