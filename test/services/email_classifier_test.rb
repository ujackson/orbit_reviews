require "test_helper"

class EmailClassifierTest < ActiveSupport::TestCase
  test "extracts email from hash-like workos user payload" do
    assert_equal "founder@acme.com", EmailClassifier.extract_email({ "email" => "founder@acme.com" })
  end

  test "recommends organization domain for business email" do
    assert_equal "acme.com", EmailClassifier.recommended_organization_domain("founder@acme.com")
  end

  test "does not recommend organization domain for consumer email" do
    assert_nil EmailClassifier.recommended_organization_domain("founder@gmail.com")
  end
end
