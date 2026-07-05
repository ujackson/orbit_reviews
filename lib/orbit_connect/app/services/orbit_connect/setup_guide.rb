module OrbitConnect
  class SetupGuide
    def self.for(id)
      provider = Catalog.all.find { |p| p[:id].to_s == id.to_s }
      return {} unless provider

      {
        id: provider[:id],
        name: provider[:name],
        setup_steps: provider[:setup_steps] || [],
        setup_fields: provider[:setup_fields] || []
      }
    end
  end
end
