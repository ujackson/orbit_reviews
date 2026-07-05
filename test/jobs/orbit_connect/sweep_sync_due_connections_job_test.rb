require "test_helper"

class OrbitConnectSweepSyncDueConnectionsJobTest < ActiveJob::TestCase
  test "enqueues sync for active due connections only" do
    workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "gmail",
      status: "connected",
      next_sync_at: 1.minute.ago
    )
    OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "slack",
      status: "connected",
      next_sync_at: 10.minutes.from_now
    )
    OrbitConnect::Connection.create!(
      workspace: workspace,
      provider_key: "outlook",
      status: "pending",
      next_sync_at: 1.minute.ago
    )

    assert_enqueued_jobs 1, only: OrbitConnect::SyncConnectionJob do
      OrbitConnect::SweepSyncDueConnectionsJob.perform_now
    end
  end
end
