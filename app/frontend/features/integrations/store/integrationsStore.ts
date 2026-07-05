/**
 * Integrations Store (Zustand)
 * Centralized state management for integration connections
 */

import { create } from 'zustand';
import { IntegrationConnection } from '../types';

interface IntegrationsStore {
  connections: IntegrationConnection[];
  addConnection: (connection: IntegrationConnection) => void;
  updateConnection: (id: string, updates: Partial<IntegrationConnection>) => void;
  removeConnection: (id: string) => void;
  getConnection: (integrationId: string) => IntegrationConnection | undefined;
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  connections: [
    // Mock initial connections for demo
    {
      id: 'conn_gmail_1',
      integrationId: 'gmail',
      status: 'connected',
      connectedAt: '2025-03-01T10:30:00Z',
      lastSync: '2 minutes ago',
      messagesCount: 1247,
      accountName: 'user@example.com',
      accountEmail: 'user@example.com',
      scopes: ['gmail.readonly', 'gmail.send', 'gmail.modify'],
    },
    {
      id: 'conn_slack_1',
      integrationId: 'slack',
      status: 'connected',
      connectedAt: '2025-03-01T09:15:00Z',
      lastSync: '5 minutes ago',
      messagesCount: 89,
      accountName: 'Example Workspace',
      scopes: ['channels:read', 'chat:write', 'users:read'],
    },
    {
      id: 'conn_sms_1',
      integrationId: 'sms_twilio',
      status: 'error',
      connectedAt: '2025-02-28T14:20:00Z',
      lastSync: '2 hours ago',
      error: 'Authentication failed. Please check your API credentials.',
      apiKeyName: 'Production SMS',
    },
  ],

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
    })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, ...updates } : conn
      ),
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
    })),

  getConnection: (integrationId) => {
    const state = get();
    return state.connections.find((conn) => conn.integrationId === integrationId);
  },
}));
