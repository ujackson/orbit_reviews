# frozen_string_literal: true

module OrbitReviewsPage
  extend ActiveSupport::Concern

  private

  def render_orbit_reviews_page(page_name, props = {})
    render inertia: page_name, props: base_orbit_reviews_props.merge(props)
  end

  def base_orbit_reviews_props
    {
      workspace: WorkspaceResource.new(Current.workspace).to_h,
      currentUser: Current.user.present? ? CurrentUserResource.new(Current.user).to_h : nil
    }
  end
end
