require "test_helper"

class OrbitConnectStateSignerTest < Minitest::Test
  DummyAttempt = Struct.new(:id, :provider_key, :state_nonce, :expires_at)

  def test_round_trip
    attempt = DummyAttempt.new(123, "gmail", "nonce", 10.minutes.from_now)
    state = OrbitConnect::StateSigner.send(:verifier).generate(
      { attempt_id: attempt.id, provider_key: attempt.provider_key, nonce: attempt.state_nonce, exp: attempt.expires_at.to_i },
      purpose: OrbitConnect::StateSigner::PURPOSE
    )

    payload = OrbitConnect::StateSigner.send(:verifier).verify(state, purpose: OrbitConnect::StateSigner::PURPOSE)
    assert_equal 123, payload["attempt_id"] || payload[:attempt_id]
  end
end
