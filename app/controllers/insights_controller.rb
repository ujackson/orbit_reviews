# frozen_string_literal: true

class InsightsController < InertiaController
  include OrbitReviewsPage

  def index
    insights = ReviewInsight.order(last_updated_at: :desc, detected_at: :desc)

    render_orbit_reviews_page("Insights", {
      insights: insights.map { |insight| ReviewInsightResource.new(insight).to_h }
    })
  end
end
