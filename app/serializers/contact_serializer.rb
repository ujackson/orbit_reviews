class ContactSerializer < ApplicationSerializer
  attributes :id, :name, :email, :organization

  attribute :avatar do |contact|
    contact.avatar_url.presence || contact.name.to_s.first.presence || "?"
  end
end
