# frozen_string_literal: true

class HomeController < InertiaController
  include OrbitReviewsPage

  def index
    render_orbit_reviews_page("Home", {
      metrics: home_metrics,
      recentInsights: ReviewInsight.order(last_updated_at: :desc).limit(5).map { |insight| ReviewInsightResource.new(insight).to_h },
      sourceAccounts: ReviewSourceAccount.order(:name).limit(5).map { |account| ReviewSourceAccountResource.new(account).to_h }
    })
  end

  private

  def home_metrics
    {
      reviewCount: Review.count,
      needsResponseCount: Review.where(workflow_status: "needs_response").count,
      activeAlertCount: ReviewAlert.where(status: "active").count,
      activeAutomationCount: AutomationRule.where(status: "active").count
    }
  end
end
