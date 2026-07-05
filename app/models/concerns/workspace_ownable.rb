module WorkspaceOwnable
  extend ActiveSupport::Concern

  included do
    belongs_to :workspace, optional: true
    default_scope { where(workspace: Current.workspace_or_raise!) }
    validates :workspace, presence: true
    before_validation :set_workspace, on: :create, if: -> { workspace.nil? }
  end

  private

  def set_workspace
    self.workspace = Current.workspace
  end

  class_methods do
    def across_all_workspaces
      unscoped
    end

    def find_across_workspaces(id)
      unscoped.find(id)
    end
  end
end
