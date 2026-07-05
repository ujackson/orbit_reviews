# frozen_string_literal: true

class AlertsController < InertiaController
  include OrbitReviewsPage

  def index
    alerts = ReviewAlert.order(detected_at: :desc, created_at: :desc)

    render_orbit_reviews_page("Alerts", {
      alerts: alerts.map { |alert| ReviewAlertResource.new(alert).to_h }
    })
  end
end
