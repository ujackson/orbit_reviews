# frozen_string_literal: true

require "openssl"
require "digest"

module OrbitAi
  class Signature
    def self.hexdigest(secret_key:, timestamp:, method:, path:, body:, workspace_id:, user_id:, request_id:)
      canonical = [
        timestamp.to_s,
        method.to_s.upcase,
        path.to_s,
        Digest::SHA256.hexdigest(body.to_s),
        workspace_id.to_s,
        user_id.to_s,
        request_id.to_s
      ].join("\n")

      OpenSSL::HMAC.hexdigest("SHA256", secret_key.to_s, canonical)
    end
  end
end
