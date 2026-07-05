namespace :gmail do
  desc "Set up Gmail OAuth provider app for development"
  task setup: :environment do
    client_id = ENV["GMAIL_CLIENT_ID"].presence
    client_secret = ENV["GMAIL_CLIENT_SECRET"].presence

    abort "Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET before running gmail:setup" if client_id.blank? || client_secret.blank?

    provider_app = OrbitConnect::ProviderApp.find_or_initialize_by(
      provider_key: "gmail",
      environment: Rails.env,
      workspace_id: nil
    )

    provider_app.update!(
      name: "Gmail OAuth App (#{Rails.env})",
      client_id: client_id,
      client_secret: client_secret,
      active: true
    )

    puts "✅ Gmail OAuth app configured successfully!"
    puts "   Provider: #{provider_app.provider_key}"
    puts "   Environment: #{provider_app.environment}"
    puts "   Client ID: #{provider_app.client_id}"
    puts "   Redirect URI: http://localhost:3100/integrations/oauth/gmail/callback"
    puts ""
    puts "Next steps:"
    puts "1. Ensure redirect URI is configured in Google Cloud Console"
    puts "2. Connect Gmail in Settings → Integrations"
  end

  desc "Test Gmail connection for a workspace"
  task :test, [:workspace_id] => :environment do |t, args|
    workspace = Workspace.find(args[:workspace_id])
    connection = OrbitConnect::Connection.find_by(
      workspace_id: workspace.id,
      provider_key: "gmail",
      status: "connected"
    )

    if connection.nil?
      puts "❌ No Gmail connection found for workspace #{workspace.id}"
      puts "   Please connect Gmail in Settings → Integrations"
      exit 1
    end

    puts "Testing Gmail connection..."
    client = connection.provider.client
    profile = client.get_profile

    puts "✅ Gmail connection successful!"
    puts "   Email: #{profile['emailAddress']}"
    puts "   Messages Total: #{profile['messagesTotal']}"
    puts "   Threads Total: #{profile['threadsTotal']}"
  rescue => e
    puts "❌ Gmail connection test failed: #{e.message}"
    puts e.backtrace.first(5).join("\n")
    exit 1
  end

  desc "Manually trigger Gmail sync for a workspace"
  task :sync, [:workspace_id] => :environment do |t, args|
    workspace = Workspace.find(args[:workspace_id])
    connection = OrbitConnect::Connection.find_by(
      workspace_id: workspace.id,
      provider_key: "gmail",
      status: "connected"
    )

    if connection.nil?
      puts "❌ No Gmail connection found"
      exit 1
    end

    puts "Starting Gmail sync..."
    OrbitConnect::SyncRunner.call(connection: connection, trigger: "manual")
    puts "✅ Sync completed!"
  rescue => e
    puts "❌ Sync failed: #{e.message}"
    exit 1
  end
end
