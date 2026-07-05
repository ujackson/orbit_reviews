require "yaml"

module OrbitConnect
  class Catalog
    def self.all
      Dir[File.join(root, "config/orbit_connect/providers/*.yml")].map do |file|
        YAML.load_file(file).transform_keys(&:to_sym)
      end
    end

    def self.enabled
      all.select { |p| p[:enabled] != false }
    end

    def self.root
      OrbitConnect::Engine.root
    end
  end
end
