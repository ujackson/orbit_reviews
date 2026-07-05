# frozen_string_literal: true

class CompetitorsController < InertiaController
  include OrbitReviewsPage

  def index
    render_orbit_reviews_page("Competitors")
  end
end
