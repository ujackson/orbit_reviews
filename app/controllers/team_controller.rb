# frozen_string_literal: true

class TeamController < InertiaController
  include OrbitReviewsPage

  def index
    members = Membership.includes(:user).order(:role, :created_at)

    render_orbit_reviews_page("Team", {
      teamMembers: members.map { |member| TeamMemberResource.new(member).to_h }
    })
  end
end
