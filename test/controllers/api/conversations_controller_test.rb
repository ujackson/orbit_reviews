require "test_helper"
require "ostruct"

class ApiConversationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    @organization = OpenStruct.new(
      id: @workspace.remote_id,
      external_id: @workspace.id,
      name: "Acme",
      allow_profiles_outside_organization: false,
      domains: [],
      created_at: "2026-03-11T05:00:00.000Z",
      updated_at: "2026-03-11T05:00:00.000Z"
    )
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
      body: "Hello there",
      preview: "Hello there",
      timestamp: Time.current,
      status: :unread
    )
    cookies[:app_session] = "sealed"
  end

  test "index returns DB-backed conversations" do
    with_authenticated_workspace do
      get api_conversations_path(workspace_id: @workspace.id)
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal 1, body.length
    assert_equal @conversation.id, body.first["id"]
    assert_equal "Sender", body.first.dig("sender", "name")
    assert_equal "Hello there", body.first["body"]
  end

  test "index searches conversations by sender and stays workspace scoped" do
    other_workspace = Workspace.create!(remote_id: "org_#{SecureRandom.hex(8)}")
    other_contact = Contact.create!(workspace: other_workspace, email: "sender@example.com", name: "Sender")
    Conversation.create!(
      workspace: other_workspace,
      external_source: "gmail",
      external_id: "thread-other",
      sender: other_contact,
      channel: :email,
      subject: "Other workspace match",
      preview: "Should not leak",
      status: :unread,
      last_message_at: Time.current
    )

    with_authenticated_workspace do
      get api_conversations_path(workspace_id: @workspace.id), params: { searchQuery: "sender@example.com" }
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal [@conversation.id], body.map { |conversation| conversation["id"] }
  end

  test "index searches message text after cleaning invisible characters" do
    @message.update!(body: "Customer asked about the board meeting deadline.")

    with_authenticated_workspace do
      get api_conversations_path(workspace_id: @workspace.id), params: { searchQuery: "\u200Bboard\u00A0meeting\u200B" }
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal [@conversation.id], body.map { |conversation| conversation["id"] }
  end

  test "messages returns DB-backed thread messages" do
    with_authenticated_workspace do
      get "/w/#{@workspace.id}/api/conversations/#{@conversation.id}/messages"
    end

    assert_response :success

    body = JSON.parse(@response.body)
    assert_equal [@message.id], body.map { |message| message["id"] }
    assert_equal "inbound", body.first["direction"]
  end

  test "update marks conversation read" do
    with_authenticated_workspace do
      patch "/w/#{@workspace.id}/api/conversations/#{@conversation.id}", params: { status: "read" }
    end

    assert_response :success
    assert_equal "read", @conversation.reload.status
    assert_equal "read", @message.reload.status
  end

  private

  def with_authenticated_workspace(&block)
    with_singleton_stub(
      WorkOS::UserManagement,
      :load_sealed_session,
      FakeSession.new(user: OpenStruct.new(id: "user_123", email: "founder@acme.com"), organization_id: @workspace.remote_id)
    ) do
      with_singleton_stub(WorkOS::Organizations, :get_organization, @organization, &block)
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
