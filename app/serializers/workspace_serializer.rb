class WorkspaceSerializer < ApplicationSerializer
  attributes :object, :id, :name, :remote_id, :allow_profiles_outside_organization, :domains, :external_id, :created_at, :updated_at

  attribute :object do
    "organization"
  end

  attribute :name do |workspace|
    workspace.display_name
  end

  attribute :allow_profiles_outside_organization do
    object.workos_organization.allow_profiles_outside_organization || false
  rescue StandardError
    false
  end

  attribute :domains do |workspace|
    workspace.workos_organization.domains || []
  rescue StandardError
    []
  end

  attribute :external_id do |workspace|
    workspace.workos_organization.external_id || workspace.id
  rescue StandardError
    workspace.id
  end

  attribute :created_at do |workspace|
    workspace.workos_organization.created_at || workspace.created_at&.iso8601
  rescue StandardError
    workspace.created_at&.iso8601
  end

  attribute :updated_at do |workspace|
    workspace.workos_organization.updated_at || workspace.updated_at&.iso8601
  rescue StandardError
    workspace.updated_at&.iso8601
  end

  typelize object: "string"
  typelize id: "string"
  typelize name: "string"
  typelize remote_id: "string"
  typelize allow_profiles_outside_organization: "boolean"
  typelize domains: "Array<{ domain: string; state: string }>"
  typelize external_id: "string"
  typelize created_at: "string"
  typelize updated_at: "string"
end
