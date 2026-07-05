# frozen_string_literal: true

require "test_helper"

class AiEmbeddingRecordTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
  end

  test "requires tenant and content identity" do
    record = AiEmbeddingRecord.new

    assert_not record.valid?
    assert_includes record.errors[:workspace], "must exist"
    assert_includes record.errors[:content_type], "can't be blank"
    assert_includes record.errors[:content_id], "can't be blank"
  end

  test "scopes records by workspace" do
    record = AiEmbeddingRecord.create!(
      workspace: @workspace,
      content_type: "message",
      content_id: "msg_1",
      content: "Customer asked for a pricing update.",
      embedding: Array.new(1024, 0.1)
    )
    AiEmbeddingRecord.create!(
      workspace: @other_workspace,
      content_type: "message",
      content_id: "msg_2",
      content: "Different tenant content.",
      embedding: Array.new(1024, 0.2)
    )

    assert_equal [ record ], AiEmbeddingRecord.for_workspace(@workspace).to_a
  end

  test "upserts embedding returned from orbit_ai" do
    embedding = Array.new(1024, 0.3)

    record = AiEmbeddingRecord.upsert_from_orbit_ai!(
      workspace: @workspace,
      user_id: "user_1",
      content_type: "message",
      content_id: "msg_1",
      title: "Customer question",
      content: "Can you send the renewal terms?",
      metadata: { "source" => "test" },
      embedding:
    )

    updated = AiEmbeddingRecord.upsert_from_orbit_ai!(
      workspace: @workspace,
      user_id: "user_1",
      content_type: "message",
      content_id: "msg_1",
      title: "Customer question",
      content: "Can you send the renewal terms?",
      metadata: { "source" => "updated" },
      embedding: Array.new(1024, 0.4)
    )

    assert_equal record.id, updated.id
    assert_equal({ "source" => "updated" }, updated.metadata)
  end
end
