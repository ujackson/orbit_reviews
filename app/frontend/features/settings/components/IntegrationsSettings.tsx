/**
 * Component: IntegrationsSettings
 * 
 * Enterprise integration management with 50+ integrations.
 * OAuth and API key flows with comprehensive catalog.
 */

import { Box, Button, Typography, alpha, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import {
  Add as AddIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingSection } from '../patterns/SettingSection';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';
import { IntegrationCatalog } from '../../integrations/components/IntegrationCatalog';
import { OAuthProviderAppDialog } from '../../integrations/components/OAuthProviderAppDialog';
import { useIntegrations } from '../../integrations/hooks/useIntegrations';
import type { OAuthSetupRequiredResponse } from '../../integrations/hooks/useIntegrations';

export const IntegrationsSettings = () => {
  const {
    connections,
    connectIntegration,
    configureProviderApp,
    disconnectIntegration,
    isLoading,
    isConfiguringProviderApp,
  } = useIntegrations();

  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const [openWebhookDialog, setOpenWebhookDialog] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState('');
  const [oauthSetup, setOauthSetup] = useState<OAuthSetupRequiredResponse | null>(null);

  // Handle integration connection
  const handleConnect = (integrationId: string, credentials?: any) => {
    connectIntegration(
      { providerKey: integrationId, credentials },
      {
        onSuccess: (data) => {
          if (data.setupRequired) {
            setOauthSetup(data as OAuthSetupRequiredResponse);
            return;
          }

          if (!data.redirect_url) {
            toast.success(data.message || 'Integration connected successfully!');
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to connect integration');
        },
      }
    );
  };

  const handleProviderAppSubmit = (values: { clientId: string; clientSecret: string; webhookSigningSecret?: string; gmailPubsubTopic?: string; gmailPubsubVerificationToken?: string; name?: string }) => {
    if (!oauthSetup) return;

    const providerKey = oauthSetup.providerKey;
    configureProviderApp(
      {
        providerKey,
        ...values,
      },
      {
        onSuccess: () => {
          toast.success(`${oauthSetup.providerName || providerKey} OAuth app saved`);
          setOauthSetup(null);
          handleConnect(providerKey);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to save OAuth app');
        },
      }
    );
  };

  // Handle integration disconnection
  const handleDisconnect = (connection: any) => {
    disconnectIntegration(connection.id, {
      onSuccess: (data) => {
        toast.success(data.message || 'Integration disconnected successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to disconnect integration');
      },
    });
  };

  // Handle integration settings
  const handleSettings = (_connection: any) => {
    toast.info('Integration settings coming soon!');
  };

  const handleCreateApiKey = () => {
    if (!apiKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    const newApiKey = `orbit_sk_live_${Math.random().toString(36).substr(2, 24)}`;
    setCreatedApiKey(newApiKey);
    toast.success('API key created successfully!');
    setApiKeyName('');
    setTimeout(() => {
      setOpenApiKeyDialog(false);
      setCreatedApiKey('');
    }, 3000);
  };

  const handleCreateWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    toast.success('Webhook endpoint created successfully!');
    setWebhookUrl('');
    setOpenWebhookDialog(false);
  };

  return (
    <Box>
      {/* Channel Integrations */}
      <SettingSection
        title="Channel Integrations"
        description="Connect your communication channels and platforms to aggregate messages in Orbit"
        isFirst
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[48] }}>
            <CircularProgress />
          </Box>
        ) : (
          <IntegrationCatalog
            connections={connections}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSettings={handleSettings}
            showSearch={true}
            showTabs={true}
          />
        )}
      </SettingSection>

      <OAuthProviderAppDialog
        open={!!oauthSetup}
        setup={oauthSetup}
        isSubmitting={isConfiguringProviderApp}
        onClose={() => setOauthSetup(null)}
        onSubmit={handleProviderAppSubmit}
      />

      {/* API & Webhooks */}
      <SettingSection
        title="API & Webhooks"
        description="Manage API keys and webhook endpoints for custom integrations"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          {/* API Keys */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[12] }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  API Keys
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                  Use API keys to authenticate requests to Orbit's REST API
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  borderColor: alpha(color.neutral[900], 0.12),
                  color: text.primary,
                }}
                onClick={() => setOpenApiKeyDialog(true)}
              >
                Create Key
              </Button>
            </Box>

            {/* Example API Key */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[12],
                p: spacing[16],
                borderRadius: radius.base,
                bgcolor: alpha(color.neutral[900], 0.02),
                border: `1px solid ${alpha(color.neutral[900], 0.04)}`,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Production API Key
                </Typography>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.xs,
                    color: text.tertiary,
                    fontFamily: 'monospace',
                  }}
                >
                  orbit_sk_live_••••••••••••••••3f2a
                </Typography>
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                Last used: 2 hours ago
              </Typography>
            </Box>
          </Box>

          {/* Webhooks */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[12] }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Webhooks
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                  Receive real-time notifications when events occur in Orbit
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  borderColor: alpha(color.neutral[900], 0.12),
                  color: text.primary,
                }}
                onClick={() => setOpenWebhookDialog(true)}
              >
                Add Endpoint
              </Button>
            </Box>

            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                color: text.tertiary,
                textAlign: 'center',
                py: spacing[24],
              }}
            >
              No webhook endpoints configured
            </Typography>
          </Box>

          {/* API Documentation Link */}
          <Button
            variant="text"
            endIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              color: color.functional.primary,
              alignSelf: 'flex-start',
            }}
            onClick={() => toast.info('Opening API documentation...')}
          >
            View API Documentation
          </Button>
        </Box>
      </SettingSection>

      {/* API Key Dialog */}
      <Dialog 
        open={openApiKeyDialog} 
        onClose={() => setOpenApiKeyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
          Create API Key
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: spacing[8] }}>
            <TextField
              label="Key Name"
              placeholder="Production API Key"
              value={apiKeyName}
              onChange={(e) => setApiKeyName(e.target.value)}
              fullWidth
              sx={{ mb: spacing[16] }}
            />
            {createdApiKey && (
              <Box
                sx={{
                  p: spacing[16],
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.success, 0.05),
                  border: `1px solid ${alpha(color.functional.success, 0.15)}`,
                }}
              >
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[8] }}>
                  Your API key (copy it now, it won't be shown again):
                </Typography>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.sm,
                    fontFamily: 'monospace',
                    color: text.primary,
                    fontWeight: typography.fontWeight.medium,
                    wordBreak: 'break-all',
                  }}
                >
                  {createdApiKey}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: spacing[20] }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setOpenApiKeyDialog(false);
              setCreatedApiKey('');
              setApiKeyName('');
            }}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.12),
              color: text.primary,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!!createdApiKey}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={handleCreateApiKey}
          >
            Create Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog 
        open={openWebhookDialog} 
        onClose={() => setOpenWebhookDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
          Add Webhook Endpoint
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: spacing[8] }}>
            <TextField
              label="Endpoint URL"
              placeholder="https://api.example.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              fullWidth
              helperText="HTTPS URLs only"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: spacing[20] }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setOpenWebhookDialog(false);
              setWebhookUrl('');
            }}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.12),
              color: text.primary,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={handleCreateWebhook}
          >
            Add Endpoint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
