# frozen_string_literal: true

class InboxController < InertiaController
  include OrbitReviewsPage

  def index
    reviews = Review.order(reviewed_at: :desc, created_at: :desc).includes(:review_analysis, :review_source_account)

    render_orbit_reviews_page("Inbox", {
      reviews: reviews.map { |review| ReviewResource.new(review).to_h }
    })
  end
end
