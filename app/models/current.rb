class Current < ActiveSupport::CurrentAttributes
  attribute :workspace, :user

  def workspace_or_raise!
    workspace || raise(ActiveRecord::RecordNotFound, "No workspace context set. This usually means the user is not authenticated or workspace was not set.")
  end
end
