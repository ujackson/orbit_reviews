import { Box, Button, Typography, alpha, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add as AddIcon, Launch as LaunchIcon, Extension as IntegrationIcon } from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { SettingSection } from '../patterns/SettingSection';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';

const CONNECTED = [
  { name: 'Google Business Profile', type: 'Review Source', last: '1 min ago', dot: '#4285F4' },
  { name: 'Apple App Store', type: 'Review Source', last: '3 min ago', dot: '#555' },
  { name: 'Google Play', type: 'Review Source', last: '3 min ago', dot: '#3DDC84' },
  { name: 'G2', type: 'Review Source', last: '5 min ago', dot: '#FF492C' },
  { name: 'Trustpilot', type: 'Review Source', last: '2 min ago', dot: '#00B67A' },
  { name: 'Capterra', type: 'Review Source', last: '12 min ago', dot: '#FF9500' },
  { name: 'Yelp', type: 'Review Source', last: '8 min ago', dot: '#D32323' },
  { name: 'Slack', type: 'Action', last: 'Active', dot: '#7D5AC9' },
  { name: 'Jira', type: 'Action', last: 'Active', dot: '#0052CC' },
];

export const IntegrationsSettings = () => {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();

  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const [openWebhookDialog, setOpenWebhookDialog] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState('');

  const handleCreateApiKey = () => {
    if (!apiKeyName.trim()) { toast.error('Please enter a name for the API key'); return; }
    const key = `orbit_sk_live_${Math.random().toString(36).substring(2, 26)}`;
    setCreatedApiKey(key);
    toast.success('API key created');
    setApiKeyName('');
    setTimeout(() => { setOpenApiKeyDialog(false); setCreatedApiKey(''); }, 3000);
  };

  const handleCreateWebhook = () => {
    if (!webhookUrl.trim()) { toast.error('Please enter a webhook URL'); return; }
    toast.success('Webhook endpoint registered');
    setWebhookUrl('');
    setOpenWebhookDialog(false);
  };

  return (
    <Box>
      {/* Connected integrations */}
      <SettingSection
        title="Connected Integrations"
        description="Review sources and action integrations currently active in this workspace"
        isFirst
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CONNECTED.map((conn, i) => (
            <Box
              key={conn.name}
              sx={{
                display: 'flex', alignItems: 'center', gap: spacing[12],
                px: spacing[16], py: spacing[12],
                borderBottom: i < CONNECTED.length - 1 ? `1px solid ${alpha(color.neutral[900], 0.06)}` : 'none',
                '&:hover': { bgcolor: alpha(color.neutral[900], 0.02) },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: conn.dot, flexShrink: 0 }} />
              <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: text.primary, flex: 1 }}>
                {conn.name}
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, width: 100 }}>
                {conn.type}
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: color.functional.success, width: 80, textAlign: 'right' }}>
                {conn.last}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: spacing[16] }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IntegrationIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(workspacePath('connections'))}
            sx={{
              fontSize: typography.fontSize.sm, textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.15), color: text.secondary,
            }}
          >
            Manage all integrations
          </Button>
        </Box>
      </SettingSection>

      {/* API & Webhooks */}
      <SettingSection title="API & Webhooks" description="Manage API keys and webhook endpoints for custom integrations">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          <Box sx={{ p: spacing[20], borderRadius: radius.base, bgcolor: alpha(color.neutral[900], 0.015), border: `1px solid ${alpha(color.neutral[900], 0.06)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[12] }}>
              <Box>
                <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: text.primary, mb: spacing[4] }}>
                  API Keys
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                  Authenticate requests to the Orbit Reviews REST API
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{ fontSize: typography.fontSize.sm, textTransform: 'none', borderColor: alpha(color.neutral[900], 0.12), color: text.primary }}
                onClick={() => setOpenApiKeyDialog(true)}>
                Create Key
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], p: spacing[16], borderRadius: radius.base, bgcolor: alpha(color.neutral[900], 0.02), border: `1px solid ${alpha(color.neutral[900], 0.04)}` }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: text.primary, mb: spacing[4] }}>
                  Production API Key
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary, fontFamily: 'monospace' }}>
                  orbit_sk_live_••••••••••••••••3f2a
                </Typography>
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>Last used: 2h ago</Typography>
            </Box>
          </Box>

          <Box sx={{ p: spacing[20], borderRadius: radius.base, bgcolor: alpha(color.neutral[900], 0.015), border: `1px solid ${alpha(color.neutral[900], 0.06)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[12] }}>
              <Box>
                <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: text.primary, mb: spacing[4] }}>
                  Webhooks
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                  Receive real-time events when review activity occurs
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{ fontSize: typography.fontSize.sm, textTransform: 'none', borderColor: alpha(color.neutral[900], 0.12), color: text.primary }}
                onClick={() => setOpenWebhookDialog(true)}>
                Add Endpoint
              </Button>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, textAlign: 'center', py: spacing[24] }}>
              No webhook endpoints configured
            </Typography>
          </Box>

          <Button variant="text" endIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
            sx={{ fontSize: typography.fontSize.sm, textTransform: 'none', color: color.functional.primary, alignSelf: 'flex-start' }}
            onClick={() => toast.info('Opening API documentation…')}>
            View API Documentation
          </Button>
        </Box>
      </SettingSection>

      {/* API Key Dialog */}
      <Dialog open={openApiKeyDialog} onClose={() => setOpenApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>Create API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: spacing[8] }}>
            <TextField label="Key Name" placeholder="Production API Key" value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} fullWidth sx={{ mb: spacing[16] }} />
            {createdApiKey && (
              <Box sx={{ p: spacing[16], borderRadius: radius.base, bgcolor: alpha(color.functional.success, 0.05), border: `1px solid ${alpha(color.functional.success, 0.15)}` }}>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[8] }}>Your key (copy now — won't be shown again):</Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, fontFamily: 'monospace', color: text.primary, wordBreak: 'break-all' }}>{createdApiKey}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: spacing[20] }}>
          <Button onClick={() => { setOpenApiKeyDialog(false); setCreatedApiKey(''); setApiKeyName(''); }} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
          <Button variant="contained" disabled={!!createdApiKey} onClick={handleCreateApiKey}
            sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
            Create Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={openWebhookDialog} onClose={() => setOpenWebhookDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>Add Webhook Endpoint</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: spacing[8] }}>
            <TextField label="Endpoint URL" placeholder="https://api.example.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} fullWidth helperText="HTTPS URLs only" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: spacing[20] }}>
          <Button onClick={() => { setOpenWebhookDialog(false); setWebhookUrl(''); }} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateWebhook}
            sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
            Add Endpoint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
