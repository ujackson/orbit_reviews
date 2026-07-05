require "test_helper"
require "ostruct"

class WebhooksControllerTest < ActionDispatch::IntegrationTest
  test "organization webhook upserts workspace" do
    event = OpenStruct.new(
      event: "organization.created",
      data: OpenStruct.new(
        id: "org_123",
        external_id: SecureRandom.uuid,
        name: "Acme",
        domain_data: [ { "domain" => "acme.com", "state" => "pending" } ]
      )
    )

    with_singleton_stub(WorkOS::Webhooks, :construct_event, event) do
      post webhooks_workos_path, params: "{}", headers: { "WorkOS-Signature" => "test" }
    end

    assert_response :success

    workspace = Workspace.find_by(remote_id: "org_123")
    assert_not_nil workspace
    assert_equal event.data.external_id, workspace.id
    assert_equal "org_123", workspace.remote_id
  end

  test "organization membership created webhook upserts workspace from parent organization" do
    org = OpenStruct.new(
      id: "org_123",
      external_id: SecureRandom.uuid,
      name: "Acme"
    )
    event = OpenStruct.new(
      event: "organization_membership.created",
      data: OpenStruct.new(
        id: "om_123",
        organization_id: org.id
      )
    )

    with_singleton_stub(WorkOS::Webhooks, :construct_event, event) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, org) do
        post webhooks_workos_path, params: "{}", headers: { "WorkOS-Signature" => "test" }
      end
    end

    assert_response :success

    workspace = Workspace.find_by(remote_id: org.id)
    assert_not_nil workspace
    assert_equal org.external_id, workspace.id
  end

  test "organization membership updated webhook upserts workspace from parent organization" do
    org = OpenStruct.new(
      id: "org_456",
      external_id: SecureRandom.uuid,
      name: "Beta"
    )
    event = OpenStruct.new(
      event: "organization_membership.updated",
      data: OpenStruct.new(
        id: "om_456",
        organization_id: org.id
      )
    )

    with_singleton_stub(WorkOS::Webhooks, :construct_event, event) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, org) do
        post webhooks_workos_path, params: "{}", headers: { "WorkOS-Signature" => "test" }
      end
    end

    assert_response :success

    workspace = Workspace.find_by(remote_id: org.id)
    assert_not_nil workspace
    assert_equal org.external_id, workspace.id
  end

  test "organization webhook accepts hash payload data" do
    external_id = SecureRandom.uuid
    event = OpenStruct.new(
      event: "organization.created",
      data: {
        "id" => "org_hash_123",
        "external_id" => external_id,
        "name" => "Hash Org"
      }
    )

    with_singleton_stub(WorkOS::Webhooks, :construct_event, event) do
      post webhooks_workos_path, params: "{}", headers: { "WorkOS-Signature" => "test" }
    end

    assert_response :success

    workspace = Workspace.find_by(remote_id: "org_hash_123")
    assert_not_nil workspace
    assert_equal external_id, workspace.id
  end
end
