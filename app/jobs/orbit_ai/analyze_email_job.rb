# frozen_string_literal: true

module OrbitAi
  class AnalyzeEmailJob < ApplicationJob
    queue_as :default

    def perform(message_id:, workspace_id:, user_id: "system")
      message = Message.joins(:conversation).where(conversations: { workspace_id: }).find(message_id)
      result = OrbitAi::Client.new(workspace_id:, user_id:).analyze_email(message)

      if result.success?
        Rails.logger.info("orbit_ai analysis completed workspace_id=#{workspace_id} message_id=#{message_id} result=#{result.data.inspect}")
      else
        Rails.logger.warn("orbit_ai analysis failed workspace_id=#{workspace_id} message_id=#{message_id} error=#{result.error}")
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.warn("orbit_ai analysis skipped: #{e.message}")
    end
  end
end
