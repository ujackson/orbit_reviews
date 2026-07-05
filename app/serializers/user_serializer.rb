# frozen_string_literal: true

class UserSerializer < ApplicationSerializer
  attribute :id do |user|
    extract_value(user, :id)
  end

  attribute :email do |user|
    extract_value(user, :email)
  end

  attribute :first_name do |user|
    extract_value(user, :first_name)
  end

  attribute :last_name do |user|
    extract_value(user, :last_name)
  end

  attribute :profile_picture_url do |user|
    extract_value(user, :profile_picture_url)
  end

  typelize id: "string?"
  typelize email: "string?"
  typelize first_name: "string?"
  typelize last_name: "string?"
  typelize profile_picture_url: "string?"

  private

  def extract_value(user, key)
    if user.respond_to?(key)
      user.public_send(key)
    elsif user.respond_to?(:[])
      user[key] || user[key.to_s]
    end
  end
end
