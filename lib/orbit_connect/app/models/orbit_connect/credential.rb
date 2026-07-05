module OrbitConnect
  class Credential < ApplicationRecord
    self.table_name = "orbit_connect_credentials"

    belongs_to :connection, class_name: "OrbitConnect::Connection"

    encrypts :access_token
    encrypts :refresh_token
    encrypts :api_key
    encrypts :password
    encrypts :secret

    scope :refreshable, -> {
      where.not(refresh_token: [nil, ""])
        .where.not(access_token_expires_at: nil)
        .where("access_token_expires_at <= ?", OrbitConnect.config.token_refresh_window_seconds.to_i.seconds.from_now)
    }

    def revoke!
      update!(
        access_token: nil,
        refresh_token: nil,
        api_key: nil,
        password: nil,
        secret: nil,
        access_token_expires_at: nil,
        metadata: (metadata || {}).merge("revoked_at" => Time.current.iso8601)
      )
    end
  end
end
