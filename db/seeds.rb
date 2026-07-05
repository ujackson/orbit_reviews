workspace = Workspace.find_or_create_by!(remote_id: "dev_acme_corp") do |w|
  w.name = "Acme Corp"
end
workspace.update!(name: "Acme Corp")
Current.workspace = workspace

admin = User.find_or_create_by!(email: "sarah.chen@acme.example") do |user|
  user.first_name = "Sarah"
  user.last_name = "Chen"
  user.workos_user_id = "dev_user_sarah_chen"
end
Membership.find_or_create_by!(workspace:, user: admin) do |membership|
  membership.role = "admin"
  membership.status = "active"
end

sources = [
  [ "google", "Google Business", "review_source", "healthy" ],
  [ "appstore", "App Store", "review_source", "delayed" ],
  [ "playstore", "Google Play", "review_source", "syncing" ],
  [ "g2", "G2", "review_source", "healthy" ],
  [ "trustpilot", "Trustpilot", "review_source", "action_required" ]
].to_h do |provider, name, category, status|
  source = ReviewSource.find_or_create_by!(workspace:, provider:) do |record|
    record.name = name
    record.category = category
    record.status = status
  end
  source.update!(name:, category:, status:)
  [ provider, source ]
end

accounts = [
  [ "google", "Google Business", "gbp-acme", "healthy", "connected", 18_420, "1 min ago" ],
  [ "appstore", "App Store", "appstore-acme", "delayed", "connected", 11_203, "3 min ago" ],
  [ "playstore", "Google Play", "play-acme", "syncing", "connected", 8_940, "3 min ago" ],
  [ "g2", "G2", "g2-acme", "healthy", "connected", 4_210, "5 min ago" ],
  [ "trustpilot", "Trustpilot", "trustpilot-acme", "action_required", "reconnect_required", 3_180, "2 min ago" ]
].to_h do |provider, name, external_id, status, auth_status, records_count, sync_frequency|
  account = ReviewSourceAccount.find_or_create_by!(workspace:, review_source: sources.fetch(provider), external_account_id: external_id) do |record|
    record.name = name
  end
  account.update!(
    name:,
    status:,
    auth_status:,
    records_count:,
    sync_frequency:,
    last_sync_at: 5.minutes.ago,
    latest_review_at: 10.minutes.ago
  )
  [ provider, account ]
end

review_rows = [
  {
    provider: "appstore",
    external_id: "appstore-r1",
    rating: 1,
    title: "Cannot log in after updating to v5.1.0",
    body: "Since the latest update I cannot access my account. The app crashes immediately after entering my credentials on my Pixel 7 Pro. I have tried reinstalling three times. This is completely unacceptable for a paid application.",
    author_name: "Marcus T.",
    product_name: "Orbit Mobile",
    app_version: "v5.1.0",
    platform: "Android",
    reviewed_at: Time.zone.parse("2026-06-15 14:14"),
    workflow_status: "needs_response",
    sentiment: "negative",
    analysis: {
      summary: "Android login crash after v5.1.0 blocks account access.",
      severity: "critical",
      related_review_count: 89,
      signals: [ "1-star rating", "Account access blocked", "Android device", "App version v5.1.0" ],
      themes: [ "Authentication", "Crash after login" ]
    }
  },
  {
    provider: "g2",
    external_id: "g2-r2",
    rating: 5,
    title: "Best review management platform — transformed our CX operations",
    body: "Orbit has completely transformed how we manage customer feedback across 200+ locations. The response suggestions are consistently on-brand and the automated triage saves our team 4+ hours weekly.",
    author_name: "Sarah L.",
    product_name: "Enterprise",
    platform: "250 locations",
    reviewed_at: Time.zone.parse("2026-06-15 10:32"),
    workflow_status: "response_posted",
    sentiment: "positive",
    analysis: {
      summary: "Enterprise customer praises review operations workflow gains.",
      severity: "low",
      related_review_count: 12,
      signals: [ "5-star rating", "Response rate improvement cited", "Enterprise segment" ],
      themes: [ "Product value", "Workflow automation" ]
    }
  },
  {
    provider: "google",
    external_id: "google-r3",
    rating: 2,
    title: "Shipping arrived damaged for second time this month",
    body: "Second order in a row with visible packaging damage. The product inside was also affected this time — the corner of the device is visibly cracked. I have photos.",
    author_name: "Jennifer K.",
    product_name: "Orbit Pro",
    location_name: "Austin, TX",
    reviewed_at: Time.zone.parse("2026-06-14 16:05"),
    workflow_status: "escalated",
    sentiment: "negative",
    analysis: {
      summary: "Repeat shipping damage with product impact in Austin.",
      severity: "high",
      related_review_count: 31,
      signals: [ "2-star rating", "Repeat occurrence", "Physical damage to unit", "Austin, TX" ],
      themes: [ "Shipping damage", "Packaging quality" ]
    }
  },
  {
    provider: "trustpilot",
    external_id: "trustpilot-r4",
    rating: 4,
    title: "Powerful platform — onboarding took longer than expected",
    body: "Very happy with Orbit overall. The dashboard is incredibly powerful once you are set up. Onboarding took longer than expected but the support team was responsive.",
    author_name: "David R.",
    product_name: "Orbit Business",
    platform: "12 locations",
    reviewed_at: Time.zone.parse("2026-06-14 13:18"),
    workflow_status: "needs_response",
    sentiment: "positive",
    analysis: {
      summary: "Positive review with onboarding friction.",
      severity: "medium",
      related_review_count: 28,
      signals: [ "4-star rating", "Onboarding friction cited", "Support praised" ],
      themes: [ "Onboarding experience", "Support quality" ]
    }
  },
  {
    provider: "playstore",
    external_id: "play-r5",
    rating: 3,
    title: "Desktop analytics superior — mobile app needs investment",
    body: "We use both Orbit and Intercom. Orbit's desktop analytics are far superior but the mobile experience still has significant gaps vs competitors.",
    author_name: "Alex M.",
    product_name: "Orbit Pro",
    platform: "Android",
    reviewed_at: Time.zone.parse("2026-06-13 09:47"),
    workflow_status: "closed",
    sentiment: "neutral",
    analysis: {
      summary: "Competitor comparison identifies mobile experience gap.",
      severity: "medium",
      related_review_count: 44,
      signals: [ "3-star rating", "Competitor comparison", "Mobile gap identified" ],
      themes: [ "Mobile experience", "Competitor comparison" ]
    }
  }
]

reviews = review_rows.map do |row|
  review = Review.find_or_create_by!(workspace:, source_provider: row[:provider], external_id: row[:external_id]) do |record|
    record.review_source_account = accounts.fetch(row[:provider])
    record.rating = row[:rating]
    record.title = row[:title]
    record.body = row[:body]
    record.reviewed_at = row[:reviewed_at]
  end
  review.update!(row.except(:provider, :analysis).merge(review_source_account: accounts.fetch(row[:provider])))
  analysis = row.fetch(:analysis)
  ReviewAnalysis.find_or_create_by!(workspace:, review:).update!(
    summary: analysis[:summary],
    sentiment: review.sentiment,
    severity: analysis[:severity],
    related_review_count: analysis[:related_review_count],
    signals: analysis[:signals].map { |label| { label: } },
    themes: analysis[:themes]
  )
  review
end

theme_rows = [
  [ "Shipping damage", "Packaging and carrier damage reports.", "negative", 31, 0.064, -18, "monitoring" ],
  [ "Authentication failures", "Login and account access regressions.", "negative", 89, 0.184, 34, "investigating" ],
  [ "Onboarding experience", "Setup speed and team activation feedback.", "mixed", 28, 0.058, -14, "monitoring" ],
  [ "Support response times", "Enterprise SLA and wait time complaints.", "negative", 312, 0.647, 22, "new" ],
  [ "Mobile experience", "Mobile navigation, speed, and offline gaps.", "neutral", 44, 0.091, 218, "new" ]
]
themes = theme_rows.to_h do |name, description, sentiment, count, share, change, status|
  theme = ReviewTheme.find_or_create_by!(workspace:, name:)
  theme.update!(description:, sentiment:, review_count: count, share:, change_percent: change, status:)
  [ name, theme ]
end

reviews.each do |review|
  review.review_analysis&.themes&.each do |theme_name|
    theme = themes[theme_name] || themes.values.find { |candidate| theme_name.downcase.include?(candidate.name.split.first.downcase) }
    ReviewThemeAssignment.find_or_create_by!(workspace:, review:, review_theme: theme) if theme
  end
end

[
  [ "Authentication failures after Android v5.1.0", "critical", 34, 89, "Android · v5.1.0", "investigating", "Mobile Platform" ],
  [ "Checkout complaints rising in Texas region", "high", 61, 41, "Texas · Checkout", "investigating", "Support Ops" ],
  [ "Support wait time mentioned 312 times this month", "high", 22, 312, "Enterprise tier · All sources", "new", nil ],
  [ "Competitor comparisons mentioning dark mode gap", "medium", 218, 44, "G2 · Capterra", "new", nil ],
  [ "Shipping damage reports declining after carrier change", "low", -18, 31, "All regions", "resolved", nil ]
].each do |title, severity, change, evidence, scope, status, owner|
  insight = ReviewInsight.find_or_initialize_by(workspace:, title:)
  insight.update!(
    severity:,
    change_percent: change,
    evidence_count: evidence,
    scope:,
    status:,
    owner_name: owner,
    detected_at: 7.days.ago,
    last_updated_at: 4.minutes.ago,
    metadata: { evidenceUnit: evidence == 44 ? "mentions" : "reviews" }
  )
end

[
  [ "Login failure volume spike", "critical", "active", "Mobile Platform" ],
  [ "Negative sentiment spike — regional", "high", "active", "Support Ops" ],
  [ "Average rating drop", "high", "monitoring", nil ],
  [ "Competitor mention volume increase", "medium", "active", "Product" ],
  [ "Unusual review volume — Trustpilot", "medium", "failing", "CX Ops" ]
].each do |title, severity, status, owner|
  alert = ReviewAlert.find_or_initialize_by(workspace:, title:)
  alert.update!(
    severity:,
    status:,
    owner_name: owner,
    detected_at: 2.days.ago,
    evidence: { count: rand(12..89), window: "Last 24h" }
  )
end

[
  [ "1-star review → Jira ticket", "one_star_review", "create_jira_ticket", "active", 847, nil ],
  [ "Negative spike → Slack alert", "negative_sentiment_spike", "slack_notification", "active", 12, nil ],
  [ "Competitor mention → email", "competitor_mention", "email_alert", "active", 67, nil ],
  [ "Theme spike → Linear issue", "theme_spike", "create_linear_issue", "paused", 3, nil ],
  [ "Rating drop → PagerDuty", "rating_drop", "pagerduty_alert", "failing", 0, "PagerDuty authentication expired. Reconnect in Connections." ]
].each do |name, trigger, action, status, runs, failure|
  rule = AutomationRule.find_or_initialize_by(workspace:, name:)
  rule.update!(
    trigger_type: trigger,
    conditions: {},
    action_type: action,
    action_config: {},
    status:,
    runs_count: runs,
    last_run_at: runs.positive? ? 2.hours.ago : nil,
    failure_message: failure
  )
end

reply_draft = ReviewReplyDraft.find_or_initialize_by(workspace:, review: reviews.first)
reply_draft.update!(
  body: "Hi Marcus,\n\nThank you for reporting this. We're aware of a login issue affecting some Android users after updating to v5.1.0, and our team is actively working on a resolution.",
  status: "draft",
  grounding: { basedOn: [ "Original review", "Approved response policy", "Verified product status" ] },
  created_by: admin
)
