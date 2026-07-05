/**
 * Integration System Types
 * Enterprise-grade integration management for OAuth and API Key flows
 */

export type IntegrationType = 'oauth' | 'api_key' | 'webhook';
export type IntegrationCategory = 'communication' | 'crm' | 'marketing' | 'support' | 'productivity' | 'social' | 'analytics' | 'development';
export type IntegrationStatus = 'connected' | 'syncing' | 'disconnected' | 'error' | 'pending';

export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  type: IntegrationType;
  icon: string; // Icon name from MUI icons
  color: string;
  popular?: boolean;
  recommended?: boolean;
  
  // OAuth specific
  oauthProvider?: string;
  scopes?: string[];
  
  // API Key specific
  apiKeyFields?: {
    name: string;
    label: string;
    type: 'text' | 'password';
    placeholder?: string;
    required?: boolean;
    helperText?: string;
  }[];
  
  // Documentation
  docsUrl?: string;
  setupGuideUrl?: string;
}

export interface IntegrationConnection {
  id: string;
  integrationId: string;
  status: IntegrationStatus;
  connectedAt?: string;
  lastSync?: string;
  error?: string;
  
  // Metrics
  messagesCount?: number;
  contactsCount?: number;
  
  // OAuth specific
  accountName?: string;
  accountEmail?: string;
  scopes?: string[];
  
  // API Key specific
  apiKeyName?: string;
  
  // Configuration
  settings?: Record<string, any>;
}
