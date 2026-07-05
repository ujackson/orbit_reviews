require "test_helper"

class CasingContractTest < ActiveSupport::TestCase
  test "workspace serializer emits camelCase keys for frontend props" do
    workspace = Workspace.new(
      id: SecureRandom.uuid,
      remote_id: "org_123"
    )
    organization = OpenStruct.new(
      id: workspace.remote_id,
      name: "Acme",
      external_id: workspace.id,
      allow_profiles_outside_organization: false,
      domains: [ { domain: "acme.com", state: "verified" } ],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )

    workspace.define_singleton_method(:workos_organization) { organization }

    payload = WorkspaceSerializer.new(workspace).serializable_hash

    assert_includes payload.keys, "remoteId"
    assert_includes payload.keys, "externalId"
    assert_includes payload.keys, "domains"
    assert_equal workspace.id, payload["id"]
    assert_equal "org_123", payload["remoteId"]
    assert_equal "Acme", payload["name"]
    assert_equal "organization", payload["object"]
    assert_equal workspace.id, payload["externalId"]
    assert_equal [ { domain: "acme.com", state: "verified" } ], payload["domains"]
    refute_includes payload.keys, "remote_id"
  end

  test "setup form serializer default data emits camelCase keys for frontend props" do
    payload = SetupFormSerializer.default_form_data

    assert_equal "", payload["workspaceName"]
    assert_equal "", payload["teamSize"]
    assert_equal [], payload["useCases"]
    refute payload.key?("workspace_name")
    refute payload.key?("team_size")
    refute payload.key?("use_cases")
  end
end
