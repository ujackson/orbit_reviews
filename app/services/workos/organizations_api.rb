require "json"
require "net/http"

module Workos
  class OrganizationsApi
    BASE_URL = "https://api.workos.com".freeze

    class Error < StandardError; end

    def self.create_organization!(**attributes)
      response = request!(
        method: :post,
        path: "/organizations",
        body: attributes.compact
      )

      WorkOS::Organization.new(response.body)
    end

    def self.update_organization!(organization_id:, **attributes)
      response = request!(
        method: :put,
        path: "/organizations/#{organization_id}",
        body: attributes.compact
      )

      WorkOS::Organization.new(response.body)
    end

    def self.request!(method:, path:, body:)
      uri = URI.join(BASE_URL, path)
      request_class = method == :post ? Net::HTTP::Post : Net::HTTP::Put
      request = request_class.new(uri)
      request["Authorization"] = "Bearer #{ENV.fetch("WORKOS_API_KEY")}"
      request["Content-Type"] = "application/json"
      request.body = JSON.generate(body)

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(request)
      end

      return response if response.is_a?(Net::HTTPSuccess)

      raise Error, "WorkOS organizations API #{response.code}: #{response.body}"
    end
  end
end
