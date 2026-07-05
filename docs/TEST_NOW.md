# Test Gmail Integration NOW 🚀

## Prerequisites (30 seconds)

```bash
# 1. Setup Gmail OAuth credentials
bin/rails gmail:setup
```

**Expected Output:**
```
✅ Gmail OAuth app configured successfully!
```

## Test the UI (2 minutes)

### Step 1: Start Server
```bash
bin/dev
```

### Step 2: Open Settings
```
http://localhost:3100/w/dfa66139-7894-4637-b423-ad6a28ebd1b9/settings
```

### Step 3: Connect Gmail

1. **Click "Integrations" tab**
2. **Find Gmail card** (should show "Connect" button)
3. **Click "Connect"**
4. **Google OAuth screen appears** - Select your account
5. **Click "Allow"** to grant permissions
6. **Redirected back to settings** - Success toast appears!

✅ **Gmail is now connected!**

---

## Verify It Works (1 minute)

```bash
bin/rails console
```

```ruby
# Find the connection
conn = OrbitConnect::Connection.find_by(provider_key: "gmail")

# Check it's connected
conn.status  # => "connected"
conn.workspace_id  # => "dfa66139-7894-4637-b423-ad6a28ebd1b9"

# Test Gmail API
profile = conn.provider.client.get_profile
profile["emailAddress"]  # => "your@gmail.com" ✅
```

---

## Sync Emails (30 seconds)

```bash
bin/rails gmail:sync[dfa66139-7894-4637-b423-ad6a28ebd1b9]
```

**Expected Output:**
```
Starting Gmail sync...
Gmail sync: Persisted message abc123 in thread def456
...
✅ Sync completed!
```

---

## View Synced Data (30 seconds)

```bash
bin/rails console
```

```ruby
workspace = Workspace.find("dfa66139-7894-4637-b423-ad6a28ebd1b9")

# Check what was synced
puts "Conversations: #{workspace.conversations.count}"
puts "Messages: #{workspace.messages.count}"
puts "Contacts: #{workspace.contacts.count}"

# View first conversation
conv = workspace.conversations.first
puts "Subject: #{conv.subject}"
puts "Preview: #{conv.preview}"
puts "Messages in thread: #{conv.messages.count}"

# View messages
conv.messages.each do |msg|
  puts "  From: #{msg.sender.email}"
  puts "  Date: #{msg.timestamp}"
  puts "  ---"
end
```

---

## What's Working Now ✅

- **OAuth Connection** - Full Gmail OAuth flow
- **Token Storage** - Encrypted, auto-refresh
- **Email Syncing** - Fetches messages from Gmail
- **Data Persistence** - Saves to database
- **Thread Grouping** - Groups by Gmail thread_id
- **Workspace Scoping** - All data scoped to workspace

---

## What's Next 🔄

To see emails in the Inbox UI:

1. **Build Rails API endpoints** - `GET /api/conversations`
2. **Update frontend** - Point `inboxApi.ts` to real API
3. **Background sync** - Setup solid_queue job

---

## Troubleshooting

### "Provider app not configured"
```bash
bin/rails gmail:setup
```

### OAuth redirect fails
- Check Google Cloud Console redirect URI matches:
  `http://localhost:3100/integrations/oauth/gmail/callback`

### No data synced
```ruby
# Check connection health
conn = OrbitConnect::Connection.last
conn.status  # Should be "connected"
conn.health_status  # Should be nil or "healthy"
conn.workspace  # Should return Workspace object

# Try manual sync again
OrbitConnect::SyncRunner.call(connection: conn, trigger: "manual")
```

---

**Total Time:** ~4 minutes to test end-to-end

**Full Documentation:** See `/docs/GMAIL_TESTING_QUICK_START.md`
