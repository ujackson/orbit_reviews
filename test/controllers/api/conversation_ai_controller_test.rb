require "test_helper"
require "ostruct"

class ApiConversationAiControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @organization = OpenStruct.new(external_id: @workspace.id)
    @contact = Contact.create!(workspace: @workspace, email: "sender@example.com", name: "Sender")
    @conversation = Conversation.create!(
      workspace: @workspace,
      external_source: "gmail",
      external_id: "thread-1",
      sender: @contact,
      channel: :email,
      subject: "Hello",
      preview: "Hello there",
      status: :unread,
      last_message_at: Time.current
    )
    @message = Message.create!(
      conversation: @conversation,
      external_source: "gmail",
      external_id: "message-1",
      sender: @contact,
      channel: :email,
      subject: "Hello",
      body: "Can you send this by Thursday?",
      preview: "Can you send this",
      timestamp: Time.current,
      status: :unread
    )
    cookies[:app_session] = "sealed"
  end

  test "show returns empty shape when no artifacts exist" do
    with_authenticated_workspace do
      get "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/ai"
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_nil body["ai_run"]
    assert_nil body["summary"]
    assert_equal [], body["entities"]
    assert_equal true, body["can_analyze"]
  end

  test "show returns latest artifact shape" do
    run = Ai::AnalyzeConversation.call(workspace: @workspace, conversation: @conversation, provider: Ai::Providers::StubProvider.new)

    with_authenticated_workspace do
      get "/workspaces/#{@workspace.id}/conversations/#{@conversation.id}/ai"
    end

    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal run.id, body.dig("ai_run", "id")
    assert_equal "completed", body.dig("ai_run", "status")
    assert_includes body.dig("summary", "text"), "Hello"
    assert_equal "Request for Information", body.dig("intent", "display_label")
    assert body["next_actions"].all? { |action| action["requires_approval"] }
  end

  test "analyze enqueues job and writes audit event" do
    assert_enqueued_with(job: AnalyzeConversationJob) do
      with_authenticated_workspace do
        post "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/ai/analyze"
      end
    end

    assert_response :success
    assert_equal "queued", JSON.parse(@response.body)["status"]
    assert OrbitConnect::AuditLog.where(action: "ai.analysis_requested").exists?
  end

  test "cross workspace conversation is blocked" do
    other_contact = Contact.create!(workspace: @other_workspace, email: "other@example.com", name: "Other")
    other_conversation = Conversation.create!(workspace: @other_workspace, external_source: "gmail", external_id: "thread-2", sender: other_contact)

    with_authenticated_workspace do
      get "/w/#{@workspace.id}/api/conversations/#{other_conversation.id}/ai"
    end

    assert_response :not_found
  end

  test "show refreshes expired WorkOS session before returning analysis" do
    with_singleton_stub(
      Workos::Client,
      :load_sealed_session,
      RefreshableSession.new(user: OpenStruct.new(id: "user_123", email: "founder@acme.com"), organization_id: @workspace.remote_id)
    ) do
      with_singleton_stub(Workos::Client, :get_organization, @organization) do
        get "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/ai"
      end
    end

    assert_response :success
    assert_equal "fresh-sealed-session", cookies[:app_session]
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

  class RefreshableSession
    def initialize(user:, organization_id:)
      @user = user
      @organization_id = organization_id
    end

    def authenticate(include_expired: false)
      if include_expired
        {
          authenticated: false,
          reason: "expired_jwt",
          user: @user,
          org_id: @organization_id
        }
      else
        {
          authenticated: false,
          reason: "expired_jwt"
        }
      end
    end

    def refresh(organization_id:)
      {
        authenticated: true,
        sealed_session: "fresh-sealed-session",
        user: @user,
        org_id: organization_id
      }
    end
  end
end
