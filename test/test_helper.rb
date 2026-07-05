ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

module SingletonMethodStubber
  def with_singleton_stub(target, method_name, return_value = nil, implementation: nil)
    singleton = target.singleton_class
    original_defined = singleton.method_defined?(method_name) || singleton.private_method_defined?(method_name)
    original_method = singleton.instance_method(method_name) if original_defined
    stub_impl = implementation || ->(*, **) { return_value }

    singleton.define_method(method_name, &stub_impl)
    yield
  ensure
    if original_defined
      singleton.define_method(method_name, original_method)
    else
      singleton.remove_method(method_name)
    end
  end
end

class ActiveSupport::TestCase
  include SingletonMethodStubber
end

class ActionDispatch::IntegrationTest
  include SingletonMethodStubber
end
