require "test_helper"

class OrbitConnectReviewProviderCatalogTest < ActiveSupport::TestCase
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
  end

  test "review providers expose accurate setup modes and required fields" do
    catalog = OrbitConnect::CatalogPresenter.new(workspace: @workspace).as_json.index_by { |provider| provider.fetch(:id) }

    google = catalog.fetch("google_business")
    assert_equal "oauth2", google.fetch(:auth_type)
    assert_equal "oauth", google.fetch(:setup_mode)
    assert_equal "/docs/integrations/google_business.html", google.fetch(:docs_url)
    assert_match "encrypted at rest", google.fetch(:security_note)
    assert_includes google.fetch(:capabilities), "provider_app_required"
    assert_empty google.fetch(:credential_fields)

    trustpilot = catalog.fetch("trustpilot")
    assert_equal "api_key", trustpilot.fetch(:setup_mode)
    assert_includes trustpilot.fetch(:capabilities), "private_reviews_require_oauth"
    assert_equal %w[api_key business_unit_id], trustpilot.fetch(:credential_fields).map { |field| field.fetch(:name) }

    apple = catalog.fetch("apple_app_store")
    assert_equal "jwt_private_key", apple.fetch(:setup_mode)
    assert_equal %w[api_key issuer_id key_id app_id], apple.fetch(:credential_fields).map { |field| field.fetch(:name) }

    google_play = catalog.fetch("google_play")
    assert_equal "service_account", google_play.fetch(:setup_mode)
    assert_equal %w[api_key package_name], google_play.fetch(:credential_fields).map { |field| field.fetch(:name) }

    g2 = catalog.fetch("g2")
    assert_equal "api_key", g2.fetch(:setup_mode)
    assert_includes g2.fetch(:capabilities), "subscription_required"
    assert_equal %w[api_key product_id], g2.fetch(:credential_fields).map { |field| field.fetch(:name) }
  end
end
