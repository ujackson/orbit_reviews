if defined?(JsFromRoutes)
  JsFromRoutes.config do |config|
    config.file_suffix = "Api.ts"
    config.all_helpers_file = "index.ts"
  end
end
