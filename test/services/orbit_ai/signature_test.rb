# frozen_string_literal: true

require "test_helper"

class OrbitAiSignatureTest < ActiveSupport::TestCase
  test "signs canonical request deterministically" do
    assert_equal(
      "f32d3207bf7f7e6b56ca4ea2a49f7d0c19257e9ed0815c0d7492ea73ffbe0fd1",
      OrbitAi::Signature.hexdigest(
        secret_key: "secret",
        timestamp: "1700000000",
        method: "POST",
        path: "/api/v1/analyze",
        body: "{}",
        workspace_id: "ws_1",
        user_id: "user_1",
        request_id: "req_1"
      )
    )
  end
end
