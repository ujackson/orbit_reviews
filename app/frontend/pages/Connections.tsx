import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ConnectionsView,
  type CredentialField,
  type SourceAccount,
  type SourceProvider,
  type SyncStatus,
} from '@/features/connections/ConnectionsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import integrationsApi from '@/api/IntegrationsApi';
import type { ReviewSourceAccount, SharedProps } from '@/types';

type IntegrationCatalogItem = {
  id: string;
  name: string;
  category: string;
  authType?: string;
  auth_type?: string;
  setupMode?: string;
  setup_mode?: string;
  setupNote?: string | null;
  setup_note?: string | null;
  securityNote?: string | null;
  security_note?: string | null;
  docsUrl?: string | null;
  docs_url?: string | null;
  estimatedSetupMinutes?: number;
  estimated_setup_minutes?: number;
  capabilities?: string[];
  status?: string;
  connectionsCount?: number;
  connections_count?: number;
  lastSyncAt?: string | null;
  last_sync_at?: string | null;
  healthStatus?: string | null;
  health_status?: string | null;
  credentialFields?: Array<string | CredentialField>;
  credential_fields?: Array<string | CredentialField>;
};

type IntegrationConnection = {
  id: number;
  integrationId: string;
  status: string;
  connectedAt?: string | null;
  lastSync?: string | null;
  lastTestedAt?: string | null;
  healthStatus?: string | null;
  error?: string | null;
  accountName?: string | null;
  settings?: Record<string, unknown>;
};

type ConnectionsProps = {
  sourceAccounts?: ReviewSourceAccount[];
  integrationCatalog?: IntegrationCatalogItem[];
  integrationConnections?: IntegrationConnection[];
};

const providerOrder = ['google_business', 'trustpilot', 'apple_app_store', 'google_play', 'g2'];

const providerAliases: Record<string, string> = {
  google: 'google_business',
  appstore: 'apple_app_store',
  playstore: 'google_play',
};

const fallbackProviders: IntegrationCatalogItem[] = [
  {
    id: 'google_business',
    name: 'Google Business Profile',
    category: 'Business reviews',
    authType: 'oauth2',
    setupMode: 'oauth',
    estimatedSetupMinutes: 2,
    status: 'disconnected',
    capabilities: ['reviews', 'locations', 'oauth', 'incremental_sync'],
    credentialFields: [],
    docsUrl: '/docs/integrations/google_business.html',
    setupNote: 'A Google Business Profile admin authorizes Orbit to read location reviews. No API key is required.',
    securityNote: 'Orbit stores OAuth tokens encrypted at rest and requests the minimum Business Profile review scope needed for sync.',
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    category: 'Business reviews',
    authType: 'api_key',
    setupMode: 'api_key',
    estimatedSetupMinutes: 3,
    status: 'disconnected',
    capabilities: ['reviews', 'historical_sync', 'incremental_sync'],
    credentialFields: [
      { name: 'api_key', label: 'API key', type: 'password', required: true },
      { name: 'business_unit_id', label: 'Business Unit ID', required: true },
    ],
    docsUrl: '/docs/integrations/trustpilot.html',
    setupNote: 'Use a Trustpilot API key and Business Unit ID to import service reviews.',
    securityNote: 'API keys are encrypted at rest. Do not paste review payloads, PHI, or unrelated customer data into setup fields.',
  },
  {
    id: 'apple_app_store',
    name: 'Apple App Store',
    category: 'App reviews',
    authType: 'api_key',
    setupMode: 'jwt_private_key',
    estimatedSetupMinutes: 5,
    status: 'disconnected',
    capabilities: ['reviews', 'apps', 'jwt', 'private_key'],
    credentialFields: [
      { name: 'api_key', label: 'Private key (.p8)', type: 'password', required: true },
      { name: 'issuer_id', label: 'Issuer ID', required: true },
      { name: 'key_id', label: 'Key ID', required: true },
      { name: 'app_id', label: 'App ID', required: true },
    ],
    docsUrl: '/docs/integrations/apple_app_store.html',
    setupNote: 'Create an App Store Connect API key with access to the app reviews you want Orbit to import.',
    securityNote: 'Private keys are encrypted at rest and never displayed again after submission.',
  },
  {
    id: 'google_play',
    name: 'Google Play',
    category: 'App reviews',
    authType: 'api_key',
    setupMode: 'service_account',
    estimatedSetupMinutes: 5,
    status: 'disconnected',
    capabilities: ['reviews', 'apps', 'service_account', 'replies'],
    credentialFields: [
      { name: 'api_key', label: 'Service account JSON', type: 'password', required: true },
      { name: 'package_name', label: 'Package name', required: true },
    ],
    docsUrl: '/docs/integrations/google_play.html',
    setupNote: 'Upload a Google Play service-account JSON key and package name for the Android app reviews to import.',
    securityNote: 'Service-account credentials are encrypted at rest. Use the narrowest Play Console permissions available.',
  },
  {
    id: 'g2',
    name: 'G2',
    category: 'B2B software reviews',
    authType: 'api_key',
    setupMode: 'api_key',
    estimatedSetupMinutes: 3,
    status: 'disconnected',
    capabilities: ['reviews', 'products', 'subscription_required'],
    credentialFields: [
      { name: 'api_key', label: 'API token', type: 'password', required: true },
      { name: 'product_id', label: 'Product ID', required: true },
    ],
    docsUrl: '/docs/integrations/g2.html',
    setupNote: 'Use a G2 API token and Product ID for the listing you want Orbit to sync.',
    securityNote: 'G2 tokens are encrypted at rest. Access may require the correct G2 subscription or API entitlement.',
  },
];

const formatTime = (value?: string | null, empty = 'Never') => {
  if (!value) return empty;

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return empty;

  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const normalizeProviderId = (provider?: string | null) => providerAliases[provider ?? ''] ?? provider ?? 'reviews';

const normalizeStatus = (status?: string | null, healthStatus?: string | null): SyncStatus => {
  if (healthStatus === 'unhealthy') return 'action_required';

  switch (status) {
    case 'connected':
    case 'healthy':
    case 'active':
      return 'healthy';
    case 'syncing':
      return 'syncing';
    case 'pending':
      return 'pending';
    case 'delayed':
      return 'delayed';
    case 'error':
    case 'action_required':
    case 'expired':
      return 'action_required';
    default:
      return 'disconnected';
  }
};

const normalizeCredentialFields = (fields?: Array<string | CredentialField>): CredentialField[] => {
  return (fields ?? []).map(field => {
    if (typeof field !== 'string') return field;

    return {
      name: field,
      label: field.split('_').map(part => part[0].toUpperCase() + part.slice(1)).join(' '),
      type: field.includes('key') || field.includes('token') || field.includes('secret') ? 'password' : 'text',
      required: field === 'api_key',
    };
  });
};

const errorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const body = 'body' in error ? (error as { body?: unknown }).body : undefined;

    if (body && typeof body === 'object') {
      const message = (body as { error?: unknown; message?: unknown }).error ?? (body as { message?: unknown }).message;
      if (typeof message === 'string' && message.length > 0) return message;
    }

    if (error instanceof Error && error.message && error.message !== 'Unprocessable Content') return error.message;
  }

  return fallback;
};

const connectMessage = (result: { message?: string; error?: string; setupRequired?: boolean; providerName?: string } | undefined, provider: SourceProvider) => {
  if (result?.message) return result.message;
  if (result?.error) return result.error;
  if (result?.setupRequired) return `${result.providerName ?? provider.name} needs admin OAuth setup before customers can connect.`;

  return `${provider.name} needs admin setup before OAuth can start.`;
};

const accountFromSource = (account: ReviewSourceAccount, connection?: IntegrationConnection): SourceAccount => ({
  id: `source-${account.id}`,
  name: account.name,
  status: normalizeStatus(connection?.status ?? account.status, connection?.healthStatus),
  lastSync: formatTime(connection?.lastSync ?? account.lastSyncAt),
  latestReview: formatTime(account.latestReviewAt, 'None yet'),
  recordsSynced: account.recordsCount,
  syncFrequency: account.syncFrequency ?? 'Manual',
  connectionId: connection?.id,
  error: String(connection?.error ?? account.metadata?.error ?? ''),
});

const accountFromConnection = (connection: IntegrationConnection): SourceAccount => ({
  id: `connection-${connection.id}`,
  name: connection.accountName || 'Connected account',
  status: normalizeStatus(connection.status, connection.healthStatus),
  lastSync: formatTime(connection.lastSync),
  latestReview: 'None yet',
  recordsSynced: 0,
  syncFrequency: 'Manual',
  connectionId: connection.id,
  error: connection.error ?? undefined,
});

const buildProviders = (
  catalog: IntegrationCatalogItem[] = [],
  accounts: ReviewSourceAccount[] = [],
  connections: IntegrationConnection[] = [],
): SourceProvider[] => {
  const catalogItems = catalog.length > 0 ? catalog : fallbackProviders;
  const connectionsByProvider = new Map<string, IntegrationConnection[]>();
  connections.forEach(connection => {
    const key = normalizeProviderId(connection.integrationId);
    connectionsByProvider.set(key, [...(connectionsByProvider.get(key) ?? []), connection]);
  });

  return catalogItems
    .filter(item => providerOrder.includes(item.id))
    .sort((a, b) => providerOrder.indexOf(a.id) - providerOrder.indexOf(b.id))
    .map(item => {
      const providerConnections = connectionsByProvider.get(item.id) ?? [];
      const providerAccounts = accounts.filter(account => normalizeProviderId(account.provider) === item.id);
      const usedConnectionIds = new Set<number>();

      const rows = providerAccounts.map(account => {
        const connection = providerConnections.find(candidate => {
          if (usedConnectionIds.has(candidate.id)) return false;
          return !candidate.accountName || candidate.accountName === account.name || candidate.accountName === account.externalAccountId;
        });
        if (connection) usedConnectionIds.add(connection.id);
        return accountFromSource(account, connection);
      });

      providerConnections
        .filter(connection => !usedConnectionIds.has(connection.id))
        .forEach(connection => rows.push(accountFromConnection(connection)));

      const primaryConnection = providerConnections[0];
      const status = rows.length > 0
        ? rows.find(row => row.status === 'action_required')?.status ?? rows[0].status
        : normalizeStatus(item.status, item.healthStatus ?? item.health_status);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        authType: item.authType ?? item.auth_type ?? 'api_key',
        capabilities: item.capabilities ?? [],
        status,
        healthStatus: item.healthStatus ?? item.health_status,
        lastSync: formatTime(primaryConnection?.lastSync ?? item.lastSyncAt ?? item.last_sync_at),
        credentialFields: normalizeCredentialFields(item.credentialFields ?? item.credential_fields),
        setupMode: item.setupMode ?? item.setup_mode,
        setupNote: item.setupNote ?? item.setup_note,
        securityNote: item.securityNote ?? item.security_note,
        docsUrl: item.docsUrl ?? item.docs_url,
        estimatedSetupMinutes: item.estimatedSetupMinutes ?? item.estimated_setup_minutes,
        accounts: rows,
      };
    });
};

export default function Connections({ sourceAccounts, integrationCatalog, integrationConnections }: ConnectionsProps) {
  const page = usePage<SharedProps>();
  const workspaceId = page.props.currentWorkspace?.id;
  const [busyProviderId, setBusyProviderId] = useState<string | null>(null);
  const providers = buildProviders(integrationCatalog, sourceAccounts, integrationConnections);

  const reloadConnections = () => {
    router.reload({
      only: ['sourceAccounts', 'integrationCatalog', 'integrationConnections', 'flash'],
    });
  };

  const withWorkspace = <T,>(callback: (workspaceId: string) => Promise<T>) => {
    if (!workspaceId) {
      toast.error('Workspace is not ready yet.');
      return Promise.resolve(undefined);
    }

    return callback(workspaceId);
  };

  return (
    <OrbitReviewsPage title="Connections">
      <ConnectionsView
        sources={providers}
        busyProviderId={busyProviderId}
        onConnect={(provider, values = {}) => withWorkspace(async workspace => {
          setBusyProviderId(provider.id);
          try {
            if (provider.authType === 'oauth2') {
              const result = await integrationsApi.connect({ params: { workspace_id: workspace, provider_key: provider.id } });
              if (result?.redirect_url) {
                window.location.href = result.redirect_url;
                return;
              }
              toast.info(connectMessage(result, provider));
              return;
            }

            await integrationsApi.credentials({
              params: { workspace_id: workspace, provider_key: provider.id },
              data: values,
            });
            toast.success(`${provider.name} connected. Initial sync has started.`);
            reloadConnections();
          } catch (error) {
            toast.error(errorMessage(error, `Could not connect ${provider.name}.`));
          } finally {
            setBusyProviderId(null);
          }
        })}
        onSync={(account, provider) => withWorkspace(async workspace => {
          if (!account.connectionId) return;
          setBusyProviderId(provider.id);
          try {
            await integrationsApi.sync({ params: { workspace_id: workspace, id: account.connectionId } });
            toast.success(`${account.name} sync started.`);
            reloadConnections();
          } catch (error) {
            toast.error(errorMessage(error, `Could not sync ${account.name}.`));
          } finally {
            setBusyProviderId(null);
          }
        })}
        onDisconnect={(account, provider) => withWorkspace(async workspace => {
          if (!account.connectionId) return;
          setBusyProviderId(provider.id);
          try {
            await integrationsApi.disconnect({ params: { workspace_id: workspace, id: account.connectionId } });
            toast.success(`${account.name} disconnected.`);
            reloadConnections();
          } catch (error) {
            toast.error(errorMessage(error, `Could not disconnect ${account.name}.`));
          } finally {
            setBusyProviderId(null);
          }
        })}
      />
    </OrbitReviewsPage>
  );
}
