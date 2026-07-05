module OrbitConnect
  class WebhookResult
    attr_reader :status, :body

    def initialize(status:, body: nil)
      @status = status
      @body = body
    end

    def preflight?
      body.present?
    end
  end
end
