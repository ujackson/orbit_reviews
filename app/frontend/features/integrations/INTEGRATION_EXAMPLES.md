# Integration System - Usage Examples

Complete examples demonstrating OAuth and API key integration flows in both onboarding and settings contexts.

## Example 1: Onboarding Flow with Channel Selection

Replace the Step 2 channel selection in `OnboardingPage.tsx`:

```tsx
import { OnboardingIntegrationPicker } from '@/features/integrations/components/OnboardingIntegrationPicker';
import { useIntegrationsStore } from '@/features/integrations';

// Inside OnboardingPage component:
const { addConnection } = useIntegrationsStore();

const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
const [connectedChannels, setConnectedChannels] = useState<string[]>([]);

const handleChannelSelect = (integrationId: string) => {
  setSelectedChannels(prev => 
    prev.includes(integrationId)
      ? prev.filter(id => id !== integrationId)
      : [...prev, integrationId]
  );
};

const handleChannelConnect = (integrationId: string, credentials?: any) => {
  // Create connection
  const newConnection = {
    id: `conn_${integrationId}_${Date.now()}`,
    integrationId,
    status: 'connected' as const,
    connectedAt: new Date().toISOString(),
    lastSync: 'Just now',
    messagesCount: 0,
    ...credentials,
  };
  
  addConnection(newConnection);
  setConnectedChannels(prev => [...prev, integrationId]);
  toast.success(`Connected to ${integrationId}!`);
};

// In Step 2 render:
<OnboardingIntegrationPicker
  selectedIntegrationIds={selectedChannels}
  onSelect={handleChannelSelect}
  onConnect={handleChannelConnect}
  categories={['communication', 'social']}
  maxSelections={6}
  title="Which channels do you want to connect?"
  description="Select the platforms where you communicate with customers"
/>
```

## Example 2: Settings Integration Management

Full implementation in `IntegrationsSettings.tsx`:

```tsx
import { Box } from '@mui/material';
import { IntegrationCatalog } from '@/features/integrations';
import { useIntegrationsStore } from '@/features/integrations';
import { toast } from 'sonner';

export const IntegrationsSettings = () => {
  const { 
    connections, 
    addConnection, 
    removeConnection, 
    updateConnection 
  } = useIntegrationsStore();

  const handleConnect = (integrationId: string, credentials?: any) => {
    const newConnection = {
      id: `conn_${integrationId}_${Date.now()}`,
      integrationId,
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      lastSync: 'Just now',
      messagesCount: 0,
      ...credentials,
    };

    addConnection(newConnection);
    toast.success('Integration connected successfully!');
  };

  const handleDisconnect = (connection) => {
    removeConnection(connection.id);
    toast.success('Integration disconnected');
  };

  const handleSettings = (connection) => {
    // Open integration-specific settings
    console.log('Configure:', connection);
  };

  return (
    <Box>
      <IntegrationCatalog
        connections={connections}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSettings={handleSettings}
        showSearch={true}
        showTabs={true}
      />
    </Box>
  );
};
```

## Example 3: OAuth Integration (Gmail)

Complete OAuth flow with proper error handling:

```tsx
const handleGmailConnect = async () => {
  try {
    // 1. Generate secure state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    // 2. Build OAuth URL
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/oauth/callback`,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ].join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    // 3. Open OAuth popup
    const popup = window.open(
      authUrl,
      'oauth',
      'width=600,height=700,scrollbars=yes'
    );

    // 4. Wait for callback
    const result = await waitForOAuthCallback(popup);

    // 5. Verify state
    if (result.state !== state) {
      throw new Error('Invalid OAuth state');
    }

    // 6. Exchange code for tokens (backend call)
    const response = await fetch('/api/oauth/google/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: result.code }),
    });

    const tokens = await response.json();

    // 7. Get user info
    const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }).then(r => r.json());

    // 8. Create connection
    const connection = {
      id: `conn_gmail_${Date.now()}`,
      integrationId: 'gmail',
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      lastSync: 'Just now',
      accountName: userInfo.email,
      accountEmail: userInfo.email,
      scopes: [
        'gmail.readonly',
        'gmail.send',
        'gmail.modify'
      ],
    };

    addConnection(connection);
    toast.success(`Connected to Gmail (${userInfo.email})`);

  } catch (error) {
    console.error('OAuth error:', error);
    toast.error('Failed to connect Gmail');
  } finally {
    sessionStorage.removeItem('oauth_state');
  }
};

// Helper function to wait for OAuth callback
function waitForOAuthCallback(popup: Window | null): Promise<any> {
  return new Promise((resolve, reject) => {
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        reject(new Error('OAuth popup closed'));
      }
    }, 1000);

    window.addEventListener('message', function handler(event) {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_callback') {
        clearInterval(checkClosed);
        window.removeEventListener('message', handler);
        popup?.close();
        resolve(event.data);
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      popup?.close();
      reject(new Error('OAuth timeout'));
    }, 5 * 60 * 1000);
  });
}
```

## Example 4: API Key Integration (Twilio SMS)

Complete API key flow with validation:

```tsx
const handleTwilioConnect = async (credentials: {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}) => {
  try {
    // 1. Validate credentials format
    if (!credentials.accountSid.startsWith('AC')) {
      throw new Error('Invalid Account SID format');
    }

    if (!credentials.phoneNumber.match(/^\+\d{10,15}$/)) {
      throw new Error('Invalid phone number format');
    }

    // 2. Test connection (backend call)
    const response = await fetch('/api/integrations/twilio/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountSid: credentials.accountSid,
        authToken: credentials.authToken,
        phoneNumber: credentials.phoneNumber,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Connection test failed');
    }

    const result = await response.json();

    // 3. Store encrypted credentials (backend only)
    await fetch('/api/integrations/twilio/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    // 4. Create connection
    const connection = {
      id: `conn_twilio_${Date.now()}`,
      integrationId: 'sms_twilio',
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      lastSync: 'Just now',
      apiKeyName: 'Twilio SMS',
      accountName: credentials.phoneNumber,
    };

    addConnection(connection);
    toast.success(`Connected Twilio SMS (${credentials.phoneNumber})`);

  } catch (error) {
    console.error('Twilio connection error:', error);
    toast.error(error.message || 'Failed to connect Twilio');
    throw error;
  }
};
```

## Example 5: Webhook Integration

Setting up incoming webhooks:

```tsx
const handleWebhookCreate = async () => {
  try {
    // 1. Generate webhook URL and secret
    const response = await fetch('/api/webhooks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Customer Events',
        events: ['message.received', 'customer.updated'],
      }),
    });

    const { webhookUrl, secret } = await response.json();

    // 2. Create connection
    const connection = {
      id: `conn_webhook_${Date.now()}`,
      integrationId: 'webhook_incoming',
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      settings: {
        webhookUrl,
        secret,
        events: ['message.received', 'customer.updated'],
      },
    };

    addConnection(connection);
    
    // 3. Show webhook details
    toast.success('Webhook created successfully!');
    
    // Display webhook URL and secret to user
    alert(`Webhook URL: ${webhookUrl}\nSecret: ${secret}\n\nSave these credentials - the secret won't be shown again.`);

  } catch (error) {
    console.error('Webhook creation error:', error);
    toast.error('Failed to create webhook');
  }
};
```

## Example 6: Connection Health Monitoring

Monitoring and updating connection status:

```tsx
const monitorConnectionHealth = async (connection: IntegrationConnection) => {
  try {
    // Check connection health
    const response = await fetch(`/api/integrations/${connection.integrationId}/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId: connection.id }),
    });

    const health = await response.json();

    if (health.status === 'error') {
      // Update connection with error
      updateConnection(connection.id, {
        status: 'error',
        error: health.error,
      });
      
      toast.error(`${connection.integrationId} connection error: ${health.error}`);
    } else {
      // Update last sync time and metrics
      updateConnection(connection.id, {
        status: 'connected',
        lastSync: 'Just now',
        messagesCount: health.messagesCount,
        error: undefined,
      });
    }

  } catch (error) {
    console.error('Health check error:', error);
    updateConnection(connection.id, {
      status: 'error',
      error: 'Failed to verify connection',
    });
  }
};

// Run health checks periodically
useEffect(() => {
  const interval = setInterval(() => {
    connections.forEach(conn => {
      if (conn.status === 'connected') {
        monitorConnectionHealth(conn);
      }
    });
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}, [connections]);
```

## Example 7: Reconnecting Failed Integrations

Handling reconnection flows:

```tsx
const handleReconnect = async (connection: IntegrationConnection) => {
  const integration = INTEGRATIONS.find(int => int.id === connection.integrationId);
  if (!integration) return;

  try {
    // Update status to pending
    updateConnection(connection.id, { status: 'pending' });

    if (integration.type === 'oauth') {
      // Trigger OAuth flow again
      await handleOAuthReconnect(integration, connection);
    } else if (integration.type === 'api_key') {
      // Show API key dialog to re-enter credentials
      setSelectedIntegration(integration);
      setApiKeyDialogOpen(true);
    }

  } catch (error) {
    console.error('Reconnection error:', error);
    updateConnection(connection.id, {
      status: 'error',
      error: 'Failed to reconnect',
    });
    toast.error('Failed to reconnect integration');
  }
};
```

## Example 8: Batch Operations

Connecting multiple integrations at once:

```tsx
const handleBatchConnect = async (integrationIds: string[]) => {
  const results = await Promise.allSettled(
    integrationIds.map(async (integrationId) => {
      const integration = INTEGRATIONS.find(int => int.id === integrationId);
      if (!integration) throw new Error('Integration not found');

      // Handle each integration based on type
      if (integration.type === 'oauth') {
        // Queue OAuth connections (can't do multiple popups)
        return { integrationId, queued: true };
      } else {
        // For API keys, show dialog sequentially
        return { integrationId, requiresInput: true };
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  toast.success(`${successful.length} integrations queued for connection`);
  if (failed.length > 0) {
    toast.error(`${failed.length} integrations failed`);
  }
};
```

## Backend Implementation Notes

### Secure Credential Storage

```typescript
// Backend: Store encrypted credentials
async function storeCredentials(
  userId: string,
  integrationId: string,
  credentials: any
) {
  // 1. Encrypt credentials
  const encrypted = await encrypt(JSON.stringify(credentials), SECRET_KEY);

  // 2. Store in database
  await db.integrationCredentials.create({
    userId,
    integrationId,
    encryptedData: encrypted,
    createdAt: new Date(),
  });

  // 3. Never return decrypted credentials to frontend
  return { success: true };
}
```

### OAuth Token Refresh

```typescript
// Backend: Automatic token refresh
async function refreshOAuthToken(connectionId: string) {
  const connection = await db.connections.findById(connectionId);
  
  const response = await fetch(getTokenEndpoint(connection.provider), {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
    }),
  });

  const tokens = await response.json();

  await db.connections.update(connectionId, {
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });

  return tokens.access_token;
}
```

## Testing Integration Flows

```tsx
// Mock integration for testing
const mockIntegration: IntegrationDefinition = {
  id: 'test_integration',
  name: 'Test Platform',
  description: 'For testing only',
  category: 'development',
  type: 'api_key',
  icon: 'Code',
  color: '#00FF00',
  apiKeyFields: [
    {
      name: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      helperText: 'Test with: test_key_123',
    },
  ],
};

// Test connection
const testConnection = async () => {
  await handleApiKeyConnect('test_integration', {
    apiKey: 'test_key_123',
  });
  
  // Verify connection was created
  const connection = connections.find(c => c.integrationId === 'test_integration');
  expect(connection).toBeDefined();
  expect(connection?.status).toBe('connected');
};
```
