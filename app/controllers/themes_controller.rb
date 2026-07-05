# frozen_string_literal: true

class ThemesController < InertiaController
  include OrbitReviewsPage

  def index
    themes = ReviewTheme.order(review_count: :desc, name: :asc)

    render_orbit_reviews_page("Themes", {
      themes: themes.map { |theme| ReviewThemeResource.new(theme).to_h }
    })
  end
end
