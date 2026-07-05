require_relative "lib/orbit_connect/version"

Gem::Specification.new do |spec|
  spec.name          = "orbit_connect"
  spec.version       = OrbitConnect::VERSION
  spec.authors       = ["OpenAI"]
  spec.email         = ["support@example.com"]
  spec.summary       = "Enterprise-grade integration engine for Rails applications"
  spec.description   = "A mountable Rails engine for OAuth, API keys, webhooks, sync orchestration, and operational tooling."
  spec.homepage      = "https://example.com/orbit_connect"
  spec.license       = "MIT"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir[
      "{app,config,db,lib,test}/**/*",
      "README.md",
      "Rakefile",
      "orbit_connect.gemspec"
    ]
  end

  spec.require_paths = ["lib"]

  spec.add_dependency "faraday", "~> 2.11"
  spec.add_dependency "faraday-retry", "~> 2.2"
  spec.add_dependency "oauth2", "~> 2.0"
  spec.add_dependency "rails", ">= 7.1"
end
