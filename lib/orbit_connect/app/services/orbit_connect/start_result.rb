module OrbitConnect
  class StartResult
    attr_reader :redirect_url, :props

    def initialize(redirect_url: nil, props: {})
      @redirect_url = redirect_url
      @props = props
    end

    def redirect?
      redirect_url.present?
    end
  end
end
