# Orbit Integration System - User Guide

## Visual Walkthrough

### Settings Page - Integration Catalog

```
┌────────────────────────────────────────────────────────────────────────┐
│ Channel Integrations                                                   │
│ Connect your communication channels and platforms to aggregate...     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ┌──────────────────────────────────────────────────────────┐          │
│ │ 🔍 Search integrations...                                │          │
│ └──────────────────────────────────────────────────────────┘          │
│                                                                        │
│ ┌─────────┬──────────┬─────────────┬────────┬──────────┬─────────┐   │
│ │ All (50)│Popular(12)│Communication│Social  │CRM & Sales│Support│ │   │
│ └─────────┴──────────┴─────────────┴────────┴──────────┴─────────┘   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 📧 Gmail                              ✓ Connected              │   │
│ │    Connect Gmail inbox and send/receive emails                 │   │
│ │    Last sync: 2 minutes ago • 1,247 messages                   │   │
│ │    user@example.com                  [Settings] [Disconnect]   │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 💬 Slack                              ✓ Connected              │   │
│ │    Sync Slack DMs and channel mentions                         │   │
│ │    Last sync: 5 minutes ago • 89 messages                      │   │
│ │    Example Workspace                 [Settings] [Disconnect]   │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 📱 WhatsApp Business                  [Connect]                │   │
│ │    WhatsApp Business API integration                           │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 📷 Instagram                          [Connect]                │   │
│ │    Instagram Direct messages and mentions                      │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ 💬 SMS (Twilio)                       ⚠️ Error                 │   │
│ │    Send and receive SMS via Twilio                             │   │
│ │    Authentication failed. Please check your API credentials.   │   │
│ │                                                  [Reconnect]    │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### OAuth Connection Flow

**Step 1: User Clicks "Connect" on Gmail**

```
┌─────────────────────────────────────────────────────────┐
│ Connect Gmail                                        × │
│ via google                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📧  Gmail                                               │
│     Connect Gmail inbox and send/receive emails         │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔒 You'll be redirected to google to authorize     │ │
│ │    Orbit. Your credentials are never stored by     │ │
│ │    Orbit.                                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Orbit will be able to:                                  │
│                                                         │
│ ✓ Read your email messages and settings                │
│ ✓ Send emails on your behalf                           │
│ ✓ Manage your email (read, write, delete)              │
│                                                         │
│ 🔗 View integration documentation                       │
│                                                         │
│                              [Cancel]  [Connect]        │
└─────────────────────────────────────────────────────────┘
```

**Step 2: OAuth Popup Opens (Simulated)**

```
Loading authentication window...
Connecting to Gmail...
✓ Connected to Gmail!
```

**Step 3: Connection Created**

```
┌────────────────────────────────────────────────────────────────┐
│ 📧 Gmail                              ✓ Connected              │
│    Connect Gmail inbox and send/receive emails                 │
│    Last sync: Just now • 0 messages                            │
│    user@example.com                  [Settings] [Disconnect]   │
└────────────────────────────────────────────────────────────────┘
```

### API Key Connection Flow

**Step 1: User Clicks "Connect" on Twilio SMS**

```
┌─────────────────────────────────────────────────────────┐
│ Connect SMS (Twilio)                                 × │
│ via API credentials                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 💬  SMS (Twilio)                                        │
│     Send and receive SMS via Twilio                     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔒 Your API credentials are encrypted and stored   │ │
│ │    securely. Orbit will never share your           │ │
│ │    credentials with third parties.                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Account SID *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Auth Token *                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••••••          👁️         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Twilio Phone Number *                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ +1234567890                                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 🔗 How to get API credentials                           │
│                                                         │
│                              [Cancel]  [Connect]        │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Validates and Connects**

```
Verifying credentials...
✓ SMS (Twilio) connected successfully!
```

**Step 3: Connection Created**

```
┌────────────────────────────────────────────────────────────────┐
│ 💬 SMS (Twilio)                       ✓ Connected              │
│    Send and receive SMS via Twilio                             │
│    Last sync: Just now • 0 messages                            │
│    +1234567890                       [Settings] [Disconnect]   │
└────────────────────────────────────────────────────────────────┘
```

### Onboarding Flow

**Step 2: Configure Your Inbox**

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│ Configure your inbox                                   │
│ Select your primary use cases and connect your first   │
│ channels                                               │
│                                                        │
│ What will you use Orbit for?                           │
│                                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐    │
│ │ 💬 Customer Support  │  │ 💼 Sales & Lead Mgmt │    │
│ │                   ✓  │  │                      │    │
│ └──────────────────────┘  └──────────────────────┘    │
│                                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐    │
│ │ 📢 Marketing         │  │ 👥 Team Communication│    │
│ │                      │  │                      │    │
│ └──────────────────────┘  └──────────────────────┘    │
│                                                        │
│ Select channels to connect                             │
│ You can connect more integrations later in Settings    │
│                                                        │
│ ┌────────┐  ┌────────┐  ┌────────┐                    │
│ │   📧   │  │   💬   │  │   📱   │                    │
│ │ Email  │  │ Slack  │  │WhatsApp│                    │
│ │     ✓  │  │     ✓  │  │        │                    │
│ └────────┘  └────────┘  └────────┘                    │
│                                                        │
│ ┌────────┐  ┌────────┐  ┌────────┐                    │
│ │   📷   │  │   💬   │  │        │                    │
│ │Instagram│  │  SMS   │  │        │                    │
│ │        │  │        │  │        │                    │
│ └────────┘  └────────┘  └────────┘                    │
│                                                        │
│                        [Back]  [Continue]              │
└────────────────────────────────────────────────────────┘
```

## Integration Categories

### Communication (10 integrations)
```
📧 Gmail               💬 Slack              📱 WhatsApp Business
📧 Outlook             👥 Microsoft Teams    📞 Telegram
📧 IMAP/SMTP           💬 Discord            💬 SMS (Twilio)
🌐 Web Chat Widget
```

### Social Media (6 integrations)
```
📷 Instagram           📘 Facebook           🐦 X (Twitter)
💼 LinkedIn            📺 YouTube            🎵 TikTok
```

### CRM & Sales (6 integrations)
```
☁️ Salesforce          🟠 HubSpot            📊 Pipedrive
🔵 Zendesk Sell        🤝 Close              🟧 Copper
```

### Support (6 integrations)
```
🎫 Zendesk Support     💬 Intercom           🌿 Freshdesk
🆘 Help Scout          📬 Front              🔧 Jira Service Desk
```

### Marketing (5 integrations)
```
📨 Mailchimp           📤 SendGrid           📧 Klaviyo
📮 Brevo              ⚡ ActiveCampaign
```

### Productivity (8 integrations)
```
📅 Google Calendar     📅 Outlook Calendar   📝 Notion
✅ Asana              📋 Trello             📊 Monday.com
✏️ ClickUp            📊 Airtable
```

### Development (5 integrations)
```
💻 GitHub              🦊 GitLab             🐛 Jira
📐 Linear              🚨 PagerDuty
```

### Analytics (4 integrations)
```
📊 Google Analytics    📈 Mixpanel           🔄 Segment
📉 Amplitude
```

## Status Indicators

```
✓ Connected      - Green badge, shows last sync and metrics
⚠️ Error         - Red badge, shows error message
⏳ Connecting... - Blue badge, loading state
○ Not Connected  - Gray, shows Connect button
```

## Quick Actions

### Connect Integration
1. Click "Connect" button on any integration
2. For OAuth: Review permissions → Click "Connect"
3. For API Key: Fill in credentials → Click "Connect"
4. See success notification
5. Integration shows as connected with status

### Disconnect Integration
1. Click "Disconnect" on connected integration
2. Confirm in dialog (optional)
3. Integration status changes to disconnected
4. Can reconnect at any time

### View Settings
1. Click "Settings" on connected integration
2. See integration-specific configuration
3. Update settings as needed
4. Changes apply immediately

### Reconnect Failed Integration
1. Click "Reconnect" on error integration
2. Go through connection flow again
3. Updated credentials stored
4. Integration status updates to connected

## Search & Filter

### Search
- Type in search box at top of catalog
- Searches across:
  - Integration name
  - Integration description
  - Category name
- Results update in real-time
- Clear with X button

### Filter by Category
- Click category tab to filter
- Shows count of integrations in each category
- "All" shows all 50+ integrations
- "Popular" shows popular integrations only
- Other categories show specific integrations

## Best Practices

### Security
- Never share API keys or OAuth tokens
- Disconnect unused integrations
- Review connected integrations regularly
- Use webhook secrets for incoming webhooks

### Onboarding
- Start with 2-3 core communication channels
- Add more integrations as needed
- Test connections before going live
- Review integration settings after connecting

### Settings Management
- Use search to find specific integrations quickly
- Filter by category for related integrations
- Monitor connection health regularly
- Update credentials if integration shows error

### Troubleshooting
- If connection fails, check credentials
- For OAuth errors, try disconnecting and reconnecting
- Review integration documentation for setup help
- Check API rate limits if seeing sync issues

## Common Workflows

### Adding First Integration
1. Go to Settings → Integrations
2. Find your communication platform (e.g., Gmail)
3. Click "Connect"
4. Follow OAuth or API key flow
5. Verify connection successful
6. Messages start syncing automatically

### Connecting Multiple Channels
1. Search for first channel
2. Connect and verify
3. Repeat for each channel
4. All messages aggregate in inbox
5. Filter by channel as needed

### Fixing Connection Error
1. Find integration with error badge
2. Read error message
3. Click "Disconnect" or "Reconnect"
4. Re-enter credentials if needed
5. Verify connection successful
6. Monitor for stable syncing

### Managing Integrations
1. Review connected integrations regularly
2. Disconnect unused integrations
3. Update credentials when they change
4. Monitor sync frequency and health
5. Adjust settings as needed

---

## Need Help?

- **Documentation**: See `/src/features/integrations/README.md`
- **Examples**: See `/src/features/integrations/INTEGRATION_EXAMPLES.md`
- **System Overview**: See `/docs/INTEGRATION_SYSTEM.md`
