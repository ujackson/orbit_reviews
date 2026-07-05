# Orbit Integration System

Enterprise-grade integration management system supporting 50+ integrations with both OAuth and API key authentication flows.

## Overview

The Orbit Integration System provides a comprehensive, production-ready solution for connecting external platforms and services. It handles:

- **50+ Pre-configured Integrations** across 8 categories
- **OAuth 2.0 Flow** with scope management and secure token handling
- **API Key Authentication** with field validation and secure storage
- **Webhook Support** for real-time event notifications
- **Connection Management** with status tracking and error handling
- **Searchable Catalog** with category filtering
- **Dual Context Support** for both onboarding and settings

## Architecture

### Components

#### 1. **IntegrationCatalog** (`components/IntegrationCatalog.tsx`)
The main catalog component providing search, filtering, and integration management.

**Features:**
- Full-text search across all integrations
- Category-based filtering with tabs
- Popular integrations highlighting
- Responsive grid layout
- Connection status tracking

**Usage:**
```tsx
import { IntegrationCatalog } from '@/features/integrations';

<IntegrationCatalog
  connections={connections}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  onSettings={handleSettings}
  showSearch={true}
  showTabs={true}
/>
```

#### 2. **IntegrationCard** (`components/IntegrationCard.tsx`)
Individual integration card displaying status, metrics, and actions.

**Features:**
- OAuth and API key type indicators
- Connection status badges
- Sync timestamps and message counts
- Connect/Disconnect/Settings actions
- Account information display

#### 3. **OAuthConnectDialog** (`components/OAuthConnectDialog.tsx`)
OAuth authentication flow dialog with scope permissions display.

**Features:**
- OAuth provider identification
- Scope permission list with descriptions
- Security notices
- Documentation links
- Simulated OAuth popup flow

#### 4. **ApiKeyConnectDialog** (`components/ApiKeyConnectDialog.tsx`)
API key configuration dialog with field validation.

**Features:**
- Dynamic field rendering based on integration requirements
- Password field visibility toggle
- Field validation with error messages
- Helper text and placeholders
- Secure credential handling

### Data Structure

#### Integration Definition
```typescript
interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  type: IntegrationType;
  icon: string;
  color: string;
  popular?: boolean;
  recommended?: boolean;
  
  // OAuth specific
  oauthProvider?: string;
  scopes?: string[];
  
  // API Key specific
  apiKeyFields?: ApiKeyField[];
  
  // Documentation
  docsUrl?: string;
  setupGuideUrl?: string;
}
```

#### Integration Connection
```typescript
interface IntegrationConnection {
  id: string;
  integrationId: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  connectedAt?: string;
  lastSync?: string;
  error?: string;
  messagesCount?: number;
  contactsCount?: number;
  accountName?: string;
  accountEmail?: string;
  scopes?: string[];
  apiKeyName?: string;
  settings?: Record<string, any>;
}
```

### State Management

The integration system uses Zustand for centralized state management:

```typescript
import { useIntegrationsStore } from '@/features/integrations';

const { connections, addConnection, removeConnection, updateConnection } = useIntegrationsStore();
```

**Store Methods:**
- `addConnection(connection)` - Add a new integration connection
- `updateConnection(id, updates)` - Update connection properties
- `removeConnection(id)` - Remove a connection
- `getConnection(integrationId)` - Get connection by integration ID

## Integration Categories

### 1. Communication (8 integrations)
Email, chat, and messaging platforms
- Gmail, Outlook, IMAP/SMTP
- Slack, Microsoft Teams
- WhatsApp Business, Telegram, Discord
- SMS (Twilio), Web Chat Widget

### 2. Social Media (6 integrations)
Social networks and community platforms
- Instagram, Facebook, Twitter/X
- LinkedIn, YouTube, TikTok

### 3. CRM & Sales (6 integrations)
Customer relationship management
- Salesforce, HubSpot, Pipedrive
- Zendesk Sell, Close, Copper

### 4. Support (6 integrations)
Helpdesk and customer support
- Zendesk Support, Intercom, Freshdesk
- Help Scout, Front, Jira Service Desk

### 5. Marketing (5 integrations)
Email marketing and automation
- Mailchimp, SendGrid, Klaviyo
- Brevo, ActiveCampaign

### 6. Productivity (8 integrations)
Project management and collaboration
- Google Calendar, Outlook Calendar
- Notion, Asana, Trello
- Monday.com, ClickUp, Airtable

### 7. Development (5 integrations)
Developer tools and platforms
- GitHub, GitLab, Jira
- Linear, PagerDuty

### 8. Analytics (4 integrations)
Data and analytics platforms
- Google Analytics, Mixpanel
- Segment, Amplitude

### 9. Custom (2 integrations)
Custom integrations and webhooks
- Incoming Webhook, Custom API

## Adding New Integrations

To add a new integration to the catalog:

1. **Define the integration** in `data/integrations.ts`:

```typescript
{
  id: 'new_integration',
  name: 'New Platform',
  description: 'Integration description',
  category: 'communication',
  type: 'oauth', // or 'api_key' or 'webhook'
  icon: 'Chat', // MUI icon name
  color: '#FF6B6B',
  popular: true, // optional
  
  // For OAuth integrations
  oauthProvider: 'provider_name',
  scopes: ['scope1', 'scope2'],
  
  // For API Key integrations
  apiKeyFields: [
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      helperText: 'Found in your account settings'
    }
  ],
  
  docsUrl: 'https://docs.orbit.com/integrations/new-platform',
}
```

2. **Add scope descriptions** (if OAuth) in `components/OAuthConnectDialog.tsx`:

```typescript
const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'new.scope': 'Description of what this scope allows',
};
```

3. **Test the integration** in both onboarding and settings contexts.

## OAuth Implementation

The OAuth flow is currently simulated for demo purposes. In production, implement:

1. **OAuth Initialization:**
```typescript
const handleOAuthConnect = async (integration: IntegrationDefinition) => {
  // 1. Generate state parameter for CSRF protection
  const state = generateSecureState();
  
  // 2. Build OAuth URL
  const authUrl = buildOAuthUrl({
    provider: integration.oauthProvider,
    clientId: env.OAUTH_CLIENT_ID,
    redirectUri: env.OAUTH_REDIRECT_URI,
    scopes: integration.scopes,
    state,
  });
  
  // 3. Open OAuth popup
  const popup = window.open(authUrl, 'oauth', 'width=600,height=700');
  
  // 4. Listen for callback
  await waitForOAuthCallback(popup, state);
};
```

2. **OAuth Callback Handler:**
```typescript
const handleOAuthCallback = async (code: string, state: string) => {
  // 1. Verify state parameter
  if (!verifyState(state)) throw new Error('Invalid state');
  
  // 2. Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code);
  
  // 3. Store tokens securely (backend only)
  await storeTokens(tokens);
  
  // 4. Create connection record
  addConnection({
    integrationId,
    status: 'connected',
    accessToken: tokens.access_token, // Store on backend only
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_at,
  });
};
```

## API Key Implementation

API keys are validated and stored securely:

```typescript
const handleApiKeyConnect = async (
  integrationId: string,
  credentials: Record<string, string>
) => {
  // 1. Validate credentials format
  validateCredentials(credentials);
  
  // 2. Test connection
  const isValid = await testConnection(integrationId, credentials);
  if (!isValid) throw new Error('Invalid credentials');
  
  // 3. Encrypt and store credentials (backend only)
  await storeEncryptedCredentials(integrationId, credentials);
  
  // 4. Create connection record
  addConnection({
    integrationId,
    status: 'connected',
    apiKeyName: credentials.keyName,
  });
};
```

## Security Considerations

1. **Never store credentials in frontend state** - All sensitive data (API keys, OAuth tokens) must be stored on the backend
2. **Use HTTPS only** for all OAuth redirects and API calls
3. **Implement CSRF protection** with state parameter in OAuth flows
4. **Encrypt credentials at rest** on the backend
5. **Validate all inputs** before sending to backend
6. **Implement rate limiting** for connection attempts
7. **Log security events** (connection attempts, failures, etc.)

## Usage Examples

### Basic Integration in Settings

```tsx
import { IntegrationCatalog } from '@/features/integrations';
import { useIntegrationsStore } from '@/features/integrations';

export const IntegrationsSettings = () => {
  const { connections, addConnection, removeConnection } = useIntegrationsStore();

  const handleConnect = (integrationId: string, credentials?: any) => {
    const newConnection = {
      id: `conn_${integrationId}_${Date.now()}`,
      integrationId,
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      ...credentials,
    };
    addConnection(newConnection);
  };

  return (
    <IntegrationCatalog
      connections={connections}
      onConnect={handleConnect}
      onDisconnect={removeConnection}
    />
  );
};
```

### Filtered Catalog in Onboarding

```tsx
<IntegrationCatalog
  connections={connections}
  onConnect={handleConnect}
  filterCategories={['communication', 'social']}
  showSearch={false}
  showTabs={false}
  maxItems={6}
  compact
/>
```

## Design System Integration

The integration system follows Orbit's Enterprise Color Intelligence Model:

- **85-90% Neutral Surfaces** - Card backgrounds, borders
- **Functional Colors** - Status indicators, connection badges
- **Integration Colors** - Brand colors for each platform (10% opacity backgrounds)
- **AI Purple Accent** - Popular/recommended badges (desaturated 12-15%)

## Performance Optimizations

1. **Virtualized Lists** - For large integration catalogs
2. **Lazy Loading** - Load integration metadata on demand
3. **Debounced Search** - Optimize search filtering
4. **Memoized Filters** - Cache filtered results
5. **Optimistic Updates** - Immediate UI feedback for actions

## Future Enhancements

- [ ] Batch integration connection
- [ ] Integration health monitoring dashboard
- [ ] Usage analytics per integration
- [ ] Custom integration templates
- [ ] Integration marketplace
- [ ] Advanced permission management
- [ ] Integration logs and audit trail
- [ ] Webhook event filtering
- [ ] Rate limit displays
- [ ] Integration recommendations based on usage

## Support

For integration-specific questions or issues:
- Documentation: https://docs.orbit.com/integrations
- Support: support@orbit.com
- Community: https://community.orbit.com
