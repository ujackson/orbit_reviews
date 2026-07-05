# frozen_string_literal: true

require "test_helper"
require "ostruct"

class ApiRagControllerTest < ActionDispatch::IntegrationTest
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @organization = OpenStruct.new(external_id: @workspace.id)
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(
      workspace: @workspace,
      external_source: "gmail",
      external_id: "thread-rag-controller",
      sender: @contact,
      subject: "Roadmap",
      last_message_at: Time.current
    )
    Message.create!(
      conversation: @conversation,
      external_source: "gmail",
      external_id: "message-rag-controller",
      sender: @contact,
      body: "Can you send the Q4 roadmap?",
      timestamp: Time.current
    )
    clear_enqueued_jobs
    Ai::ScheduleConversationIndex.reset_process_debounce_cache!
    cookies[:app_session] = "sealed"
  end

  test "conversation index endpoint indexes the authenticated workspace conversation" do
    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::IndexConversation, :call, { indexed_count: 1, chunk_count: 1, conversation_id: @conversation.id }) do
        post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/index"
      end
    end

    assert_response :success
    assert_equal 1, JSON.parse(@response.body)["indexed_count"]
  end

  test "conversation index blocks cross workspace access" do
    other_contact = Contact.create!(workspace: @other_workspace, email: "other@example.com", name: "Other")
    other_conversation = Conversation.create!(workspace: @other_workspace, external_source: "gmail", external_id: "thread-other", sender: other_contact)

    with_authenticated_workspace do
      post "/w/#{@workspace.id}/api/conversations/#{other_conversation.id}/rag/index"
    end

    assert_response :not_found
  end

  test "query endpoint returns rag answer" do
    payload = { "answer" => "Roadmap is due Thursday.", "sources" => [] }

    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::QueryWorkspace, :call, implementation: ->(**kwargs) {
        raise "filters were not normalized" unless kwargs[:filters].is_a?(Hash)
        raise "content_type was not permitted" unless kwargs.dig(:filters, "content_type") == "message"

        { success: true, data: payload }
      }) do
        post "/w/#{@workspace.id}/api/rag/query", params: { query: "When is roadmap due?", filters: { content_type: "message" } }, as: :json
      end
    end

    assert_response :success
    assert_equal "Roadmap is due Thursday.", JSON.parse(@response.body)["answer"]
  end

  test "conversation query indexes then searches in one request" do
    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::IndexConversation, :call, { indexed_count: 1, chunk_count: 1, conversation_id: @conversation.id }) do
        with_singleton_stub(Ai::Rag::QueryWorkspace, :call, implementation: ->(**kwargs) {
          raise "filters were not normalized" unless kwargs[:filters].is_a?(Hash)
          raise "content_type was not permitted" unless kwargs.dig(:filters, "content_type") == "message"
          raise "conversation subject missing from query" unless kwargs[:query].include?("Selected conversation subject: Roadmap")

          { success: true, data: { "answer" => "Roadmap is due Thursday.", "sources" => [] } }
        }) do
          post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/query", params: { query: "When is roadmap due?", filters: { content_type: "message" } }, as: :json
        end
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "Roadmap is due Thursday.", body["answer"]
    assert_equal 1, body["indexed_count"]
  end

  test "conversation query reuses existing selected conversation index" do
    conversation_content_id = "conversation:#{@conversation.id}"
    AiEmbeddingRecord.create!(
      workspace: @workspace,
      content_type: "message",
      content_id: "#{conversation_content_id}:chunk:1",
      title: "Roadmap",
      content: "Can you send the Q4 roadmap?",
      metadata: { "conversation_content_id" => conversation_content_id },
      embedding: Array.new(1024, 0.1)
    )

    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::IndexConversation, :call, implementation: ->(**) { raise "should not re-index existing chunks" }) do
        with_singleton_stub(Ai::Rag::QueryWorkspace, :call, implementation: ->(**kwargs) {
          raise "conversation filter missing" unless kwargs.dig(:filters, :conversation_content_id) == conversation_content_id

          { success: true, data: { "answer" => "This is about the Q4 roadmap.", "sources" => [] } }
        }) do
          post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/query", params: { query: "what is this", filters: { content_type: "message" } }, as: :json
        end
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "This is about the Q4 roadmap.", body["answer"]
    assert_equal 1, body["indexed_count"]
  end

  test "conversation query heals existing text-only index in the background" do
    conversation_content_id = "conversation:#{@conversation.id}"
    AiEmbeddingRecord.create!(
      workspace: @workspace,
      content_type: "message",
      content_id: "#{conversation_content_id}:chunk:1",
      title: "Roadmap",
      content: "Can you send the Q4 roadmap?",
      metadata: { "conversation_content_id" => conversation_content_id, "embedding_status" => "skipped" },
      embedding: nil
    )

    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::QueryWorkspace, :call, implementation: ->(**kwargs) {
        raise "conversation filter missing" unless kwargs.dig(:filters, :conversation_content_id) == conversation_content_id

        { success: true, data: { "answer" => "This is about the Q4 roadmap.", "sources" => [] } }
      }) do
        assert_enqueued_with(job: Ai::RagIndexConversationJob) do
          post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/query", params: { query: "what is this", filters: { content_type: "message" } }, as: :json
        end
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "This is about the Q4 roadmap.", body["answer"]
    assert_equal 1, body["indexed_count"]
  end

  test "conversation query returns indexing response when inline indexing takes too long" do
    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::IndexConversation, :call, implementation: ->(**) { raise Timeout::Error }) do
        assert_enqueued_with(job: Ai::RagIndexConversationJob) do
          post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/query", params: { query: "what is this" }, as: :json
        end
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal true, body["indexing"]
    assert_match "indexing", body["answer"]
  end

  test "conversation query keeps indexing when inline indexing stores no chunks" do
    with_authenticated_workspace do
      with_singleton_stub(Ai::Rag::IndexConversation, :call, { indexed_count: 0, chunk_count: 0, conversation_id: @conversation.id }) do
        with_singleton_stub(Ai::Rag::QueryWorkspace, :call, implementation: ->(**) { raise "should wait for indexed chunks" }) do
          assert_enqueued_with(job: Ai::RagIndexConversationJob) do
            post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/query", params: { query: "what is this" }, as: :json
          end
        end
      end
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal true, body["indexing"]
    assert_match "indexing", body["answer"]
  end

  test "conversation index accepts hash shaped authenticated user" do
    with_singleton_stub(
      Workos::Client,
      :load_sealed_session,
      FakeSession.new(user: { "id" => "user_hash", "email" => "founder@acme.com" }, organization_id: @workspace.remote_id)
    ) do
      with_singleton_stub(Workos::Client, :get_organization, @organization) do
        with_singleton_stub(Ai::Rag::IndexConversation, :call, { indexed_count: 1, chunk_count: 1, conversation_id: @conversation.id }) do
          post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/rag/index"
        end
      end
    end

    assert_response :success
  end


  private

  def with_authenticated_workspace(&block)
    with_singleton_stub(
      Workos::Client,
      :load_sealed_session,
      FakeSession.new(user: OpenStruct.new(id: "user_123", email: "founder@acme.com"), organization_id: @workspace.remote_id)
    ) do
      with_singleton_stub(Workos::Client, :get_organization, @organization, &block)
    end
  end

  class FakeSession
    def initialize(user:, organization_id:)
      @user = user
      @organization_id = organization_id
    end

    def authenticate(include_expired: false)
      {
        authenticated: true,
        user: @user,
        org_id: @organization_id,
        session_id: "session_123"
      }
    end
  end
end
