# frozen_string_literal: true

class AiUpdatesChannel < ApplicationCable::Channel
  def subscribed
    workspace_id = params[:workspace_id].to_s
    reject unless current_workspace.id.to_s == workspace_id

    stream_from "workspace:#{workspace_id}:ai"
  end
end
