import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import type {
  IntegrationConnection,
  IntegrationStatus,
} from '../types';

export interface IntegrationCatalogItem {
  id: string;
  name: string;
  category: string;
  auth_type: string;
  capabilities: string[];
  status: IntegrationStatus;
  connections_count: number;
  last_sync_at: string | null;
  last_tested_at: string | null;
  health_status: string | null;
  setup_url: string;
  credential_fields: any[];
}

interface ApiIntegrationConnection {
  id: string;
  integrationId: string;
  status: IntegrationStatus;
  connectedAt: string | null;
  lastSync: string | null;
  error: string | null;
  accountName: string | null;
  settings: Record<string, any>;
}

export interface IntegrationCatalogResponse {
  catalog: IntegrationCatalogItem[];
  connections: ApiIntegrationConnection[];
}

export interface OAuthSetupRequiredResponse {
  setupRequired: true;
  providerKey: string;
  providerName: string;
  message: string;
  redirectUri?: string;
  webhookUrl?: string;
  gmailPubsubUrl?: string;
  gmailPubsubTopic?: string;
  gmailPubsubConfigured?: boolean;
  webhookSupported?: boolean;
  fields: {
    name: 'clientId' | 'clientSecret' | 'webhookSigningSecret' | 'gmailPubsubTopic' | 'gmailPubsubVerificationToken';
    label: string;
    type: 'text' | 'password';
    required: boolean;
  }[];
}

export interface ConnectIntegrationResponse {
  redirect_url?: string;
  props?: Record<string, any>;
  success?: boolean;
  message?: string;
  setupRequired?: boolean;
  providerKey?: string;
  providerName?: string;
  redirectUri?: string;
  webhookUrl?: string;
  gmailPubsubUrl?: string;
  gmailPubsubTopic?: string;
  gmailPubsubConfigured?: boolean;
  webhookSupported?: boolean;
  fields?: OAuthSetupRequiredResponse['fields'];
}

export const useIntegrations = () => {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Fetch integrations catalog and connections
  const { data, isLoading, error, refetch } = useQuery<IntegrationCatalogResponse>({
    queryKey: ['integrations', workspace?.id],
    queryFn: async () => {
      const response = await fetch(`/w/${workspace?.id}/integrations`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }

      return response.json();
    },
    enabled: !!workspace?.id,
  });

  // Connect integration mutation
  const connectMutation = useMutation<ConnectIntegrationResponse, Error, { providerKey: string; credentials?: any }>({
    mutationFn: async ({ providerKey, credentials }: { providerKey: string; credentials?: any }) => {
      const url = credentials
        ? `/w/${workspace?.id}/integrations/${providerKey}/credentials`
        : `/w/${workspace?.id}/integrations/${providerKey}/connect`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: credentials ? JSON.stringify(credentials) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect integration');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // If OAuth, redirect to the OAuth URL
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // Refetch integrations list
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
      }
    },
  });

  const configureProviderAppMutation = useMutation({
    mutationFn: async ({
      providerKey,
      clientId,
      clientSecret,
      webhookSigningSecret,
      gmailPubsubTopic,
      gmailPubsubVerificationToken,
      name,
    }: {
      providerKey: string;
      clientId: string;
      clientSecret: string;
      webhookSigningSecret?: string;
      gmailPubsubTopic?: string;
      gmailPubsubVerificationToken?: string;
      name?: string;
    }) => {
      const response = await fetch(`/w/${workspace?.id}/integrations/${providerKey}/provider_app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify({ clientId, clientSecret, webhookSigningSecret, gmailPubsubTopic, gmailPubsubVerificationToken, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to configure OAuth app');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Disconnect integration mutation
  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/w/${workspace?.id}/integrations/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect integration');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Sync integration mutation
  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/w/${workspace?.id}/integrations/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync integration');
      }

      return response.json();
    },
  });

  const connections: IntegrationConnection[] = (data?.connections || []).map((connection) => ({
    id: connection.id,
    integrationId: connection.integrationId,
    status: connection.status,
    connectedAt: connection.connectedAt || undefined,
    lastSync: connection.lastSync || undefined,
    error: connection.error || undefined,
    accountName: connection.accountName || undefined,
    settings: connection.settings,
  }));

  return {
    catalog: data?.catalog || [],
    connections,
    isLoading,
    error,
    refetch,
    connectIntegration: connectMutation.mutate,
    configureProviderApp: configureProviderAppMutation.mutate,
    disconnectIntegration: disconnectMutation.mutate,
    syncIntegration: syncMutation.mutate,
    isConnecting: connectMutation.isPending,
    isConfiguringProviderApp: configureProviderAppMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSyncing: syncMutation.isPending,
  };
};
