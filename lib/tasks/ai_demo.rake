# frozen_string_literal: true

namespace :ai do
  desc "Create demo AI artifacts for the latest conversation in a workspace without external API keys"
  task :seed_demo, [:workspace_id] => :environment do |_task, args|
    workspace = args[:workspace_id].present? ? Workspace.find(args[:workspace_id]) : Workspace.order(:created_at).last
    abort "No workspace found" if workspace.blank?

    conversation = workspace.conversations.order(Arel.sql("COALESCE(last_message_at, updated_at) DESC")).first
    abort "No conversation found for workspace #{workspace.id}" if conversation.blank?

    run = Ai::AnalyzeConversation.call(
      workspace:,
      conversation:,
      provider: Ai::Providers::StubProvider.new
    )

    puts "Created AI demo artifacts for conversation #{conversation.id} with run #{run.id}"
  end
end
