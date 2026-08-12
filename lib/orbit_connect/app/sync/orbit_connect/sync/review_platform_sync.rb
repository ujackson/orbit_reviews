module OrbitConnect
  module Sync
    class ReviewPlatformSync < BaseSync
      def perform(trigger: "manual")
        sync_state_for("reviews").update!(
          checkpoint_at: Time.current,
          metadata: {
            "trigger" => trigger,
            "message" => "Review import adapter is configured; provider-specific fetch is pending."
          }
        )
      end
    end
  end
end
