# frozen_string_literal: true

require "digest"
require "timeout"

module Ai
  module Rag
    class QueryWorkspace
      DEFAULT_TOP_K = 5
      MAX_CANDIDATES = 20
      RETRIEVAL_TIMEOUT = 6.seconds
      SYNTHESIS_TIMEOUT = 12.seconds

      class << self
        def call(workspace:, query:, user_id: nil, filters: {}, top_k: DEFAULT_TOP_K, client: nil)
          new(workspace:, query:, user_id:, filters:, top_k:, client:).call
        end

        def candidates_for(workspace:, query:, user_id: nil, filters: {}, top_k: DEFAULT_TOP_K, client: nil)
          new(workspace:, query:, user_id:, filters:, top_k:, client:).candidate_payloads
        end
      end

      def initialize(workspace:, query:, user_id: nil, filters: {}, top_k: DEFAULT_TOP_K, client: nil, retrieval_timeout: RETRIEVAL_TIMEOUT, synthesis_timeout: SYNTHESIS_TIMEOUT)
        @workspace = workspace
        @query = query.to_s.strip
        @user_id = user_id
        @filters = normalize_filters(filters)
        @top_k = [[top_k.to_i, 1].max, 10].min
        @client = client || OrbitAi::Client.new(workspace_id: workspace.id, user_id: user_id || "system")
        @retrieval_timeout = retrieval_timeout
        @synthesis_timeout = synthesis_timeout
      end

      def call
        return empty_response("Query cannot be blank.") if query.blank?

        candidates = candidate_payloads
        return empty_response("No indexed workspace knowledge is available yet.") if candidates.blank?

        result = Timeout.timeout(synthesis_timeout) do
          client.rag_query(query:, filters: normalized_filters, top_k:, candidates:)
        end
        return fallback_response(candidates, "The AI answer generator is unavailable, so I found the closest indexed source.") unless result.success?

        { success: true, data: result.data }
      rescue Timeout::Error
        fallback_response(candidates, "The AI answer generator is still warming up, so I found the closest indexed source.")
      end

      private

      attr_reader :workspace, :query, :user_id, :filters, :top_k, :client, :retrieval_timeout, :synthesis_timeout

      def normalize_filters(value)
        hash =
          if value.respond_to?(:permit)
            value.permit(:content_type, :conversation_content_id).to_h
          else
            value.to_h
          end

        hash.slice("content_type", :content_type).with_indifferent_access
          .merge(hash.slice("conversation_content_id", :conversation_content_id).with_indifferent_access)
      end

      public

      def candidate_payloads
        return [] if query.blank?

        candidate_records.map { |record| candidate_payload(record) }
      end

      private

      def candidate_records
        relation = AiEmbeddingRecord.for_workspace(workspace)
        relation = relation.where(content_type: normalized_filters[:content_type]) if normalized_filters[:content_type].present?
        relation = relation.where("metadata ->> 'conversation_content_id' = ?", normalized_filters[:conversation_content_id]) if normalized_filters[:conversation_content_id].present?

        Timeout.timeout(retrieval_timeout) do
          vector = query_embedding
          if vector.present?
            vector_candidates = relation
              .where.not(embedding: nil)
              .nearest_neighbors(:embedding, vector, distance: "cosine")
              .limit(candidate_limit)
              .to_a
            vector_candidates.presence || lexical_candidates(relation)
          else
            lexical_candidates(relation)
          end
        end
      rescue Timeout::Error
        lexical_candidates(relation)
      end

      def query_embedding
        result = client.create_embedding(
          content_type: "note",
          content_id: "query:#{Digest::SHA256.hexdigest(query)[0, 24]}",
          text: query,
          metadata: { transient: true, source: "rag_query" }
        )
        return [] unless result.success?

        Array(result.data["embedding"])
      end

      def lexical_candidates(relation)
        terms = query.downcase.scan(/[[:alnum:]]+/).reject { |term| term.length < 3 }.first(8)
        return relation.order(updated_at: :desc).limit(candidate_limit).to_a if terms.blank?

        records = relation.order(updated_at: :desc).limit(100).to_a
        records
          .sort_by { |record| -lexical_score(record, terms) }
          .select { |record| lexical_score(record, terms).positive? }
          .first(candidate_limit)
      end

      def lexical_score(record, terms)
        haystack = [record.title, record.content].compact.join(" ").downcase
        terms.count { |term| haystack.include?(term) }
      end

      def candidate_payload(record)
        {
          workspace_id: record.workspace_id.to_s,
          content_type: record.content_type,
          content_id: record.content_id,
          title: record.title,
          text: record.content,
          metadata: record.metadata.to_h
        }
      end

      def normalized_filters
        filters.slice(:content_type, :conversation_content_id).compact
      end

      def candidate_limit
        [top_k * 4, MAX_CANDIDATES].min
      end

      def empty_response(answer)
        { success: true, data: { "answer" => answer, "sources" => [] } }
      end

      def fallback_response(candidates, answer_prefix)
        sources = candidates.first(top_k).map do |candidate|
          {
            "content_id" => candidate[:content_id],
            "content_type" => candidate[:content_type],
            "title" => candidate[:title],
            "score" => 0.0,
            "text" => candidate[:text].to_s.truncate(700, omission: "..."),
            "metadata" => candidate[:metadata]
          }
        end
        best = sources.first
        answer = [answer_prefix, fallback_source_sentence(best)].compact_blank.join(" ")

        { success: true, data: { "answer" => answer, "sources" => sources } }
      end

      def fallback_source_sentence(source)
        return nil if source.blank?

        title = source["title"].presence
        text = source["text"].to_s.gsub(/\s+/, " ").strip
        text = text.split(/(?<=[.!?])\s+/).first.to_s.truncate(220, omission: "...")
        [title, text].compact_blank.join(": ")
      end
    end
  end
end
