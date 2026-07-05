Typelizer.configure do |config|
  config.serializer_plugin = Typelizer::SerializerPlugins::Auto
  config.dirs = [ Rails.root.join("app/serializers") ]
  config.output_dir = "app/frontend/types/generated"
  config.comments = true
  config.reject_class = ->(serializer:) { serializer.name == "WorkspaceResource" }
end
