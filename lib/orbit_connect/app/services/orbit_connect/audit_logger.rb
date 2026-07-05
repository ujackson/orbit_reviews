module OrbitConnect
  class AuditLogger
    class << self
      def log!(action:, provider_key:, connection: nil, actor: nil, data: {})
        OrbitConnect::AuditLog.create!(
          action: action,
          provider_key: provider_key,
          connection: connection,
          actor: persisted_record(actor),
          data: data
        )
      end

      private

      def persisted_record(record)
        return record if defined?(ActiveRecord::Base) && record.is_a?(ActiveRecord::Base) && record.persisted?

        nil
      end
    end
  end
end
