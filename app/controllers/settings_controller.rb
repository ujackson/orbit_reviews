# frozen_string_literal: true

class SettingsController < InertiaController
  include OrbitReviewsPage

  def index
    render_orbit_reviews_page("Settings")
  end
end
