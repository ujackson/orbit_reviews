class EmailClassifier
  CONSUMER_DOMAINS = %w[
    gmail.com
    yahoo.com
    hotmail.com
    outlook.com
    live.com
    icloud.com
    me.com
    mac.com
    aol.com
    protonmail.com
    proton.me
    mail.com
    yandex.com
    zoho.com
    gmx.com
    inbox.com
    hey.com
    fastmail.com
  ].freeze

  class << self
    def extract_email(value)
      return if value.blank?

      if value.respond_to?(:email)
        value.email
      elsif value.respond_to?(:[])
        value[:email] || value["email"]
      end
    end

    def business_email?(email)
      domain = extract_domain(email)
      domain.present? && domain.include?(".") && !CONSUMER_DOMAINS.include?(domain)
    end

    def consumer_email?(email)
      !business_email?(email)
    end

    def extract_domain(email)
      email.to_s.split("@").last&.downcase
    end

    def recommended_organization_domain(email)
      return unless business_email?(email)

      extract_domain(email)
    end

    def recommended_workspace_name(email)
      domain = recommended_organization_domain(email)
      return unless domain

      domain.split(".").first.to_s.split(/[-_]/).map(&:capitalize).join(" ")
    end
  end
end
