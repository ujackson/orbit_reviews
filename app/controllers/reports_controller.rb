# frozen_string_literal: true

class ReportsController < InertiaController
  include OrbitReviewsPage

  def index
    render_orbit_reviews_page("Reports")
  end
end
