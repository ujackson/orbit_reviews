class Workspace < ApplicationRecord
  validates :remote_id, presence: true, uniqueness: true

  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :contacts, dependent: :destroy
  has_many :ai_embedding_records, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :review_sources, dependent: :destroy
  has_many :review_source_accounts, dependent: :destroy
  has_many :review_sync_runs, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :review_analyses, dependent: :destroy
  has_many :review_themes, dependent: :destroy
  has_many :review_theme_assignments, dependent: :destroy
  has_many :review_insights, dependent: :destroy
  has_many :review_alerts, dependent: :destroy
  has_many :review_reply_drafts, dependent: :destroy
  has_many :review_assignments, dependent: :destroy
  has_many :automation_rules, dependent: :destroy
  has_many :automation_runs, dependent: :destroy

  def workos_organization
    @workos_organization ||= Workos::Client.get_organization(id: remote_id)
  end

  def display_name
    workos_organization.name.presence || name.presence || "Acme Corp"
  rescue StandardError
    name.presence || "Acme Corp"
  end
end
