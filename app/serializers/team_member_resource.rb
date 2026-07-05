class TeamMemberResource < ApplicationSerializer
  attributes :id, :role, :status, :metadata

  attribute :user do |membership|
    {
      id: membership.user.id,
      email: membership.user.email,
      firstName: membership.user.first_name,
      lastName: membership.user.last_name,
      profilePictureUrl: membership.user.profile_picture_url
    }
  end

  typelize id: "number"
  typelize role: "string"
  typelize status: "string"
  typelize metadata: "Record<string, unknown>"
  typelize user: "{ id: string; email: string; firstName?: string; lastName?: string; profilePictureUrl?: string }"
end
