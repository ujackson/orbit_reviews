# frozen_string_literal: true

class ConnectionsController < InertiaController
  include OrbitReviewsPage

  def index
    accounts = ReviewSourceAccount.order(:name)

    render_orbit_reviews_page("Connections", {
      sourceAccounts: accounts.map { |account| ReviewSourceAccountResource.new(account).to_h }
    })
  end
end
