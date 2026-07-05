# frozen_string_literal: true

class AutomationsController < InertiaController
  include OrbitReviewsPage

  def index
    rules = AutomationRule.order(:name)

    render_orbit_reviews_page("Automations", {
      automationRules: rules.map { |rule| AutomationRuleResource.new(rule).to_h }
    })
  end
end
