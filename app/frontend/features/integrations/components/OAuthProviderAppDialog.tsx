import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { color, radius, spacing, text, typography } from '../../../shared/tokens/design-tokens';
import type { OAuthSetupRequiredResponse } from '../hooks/useIntegrations';

interface OAuthProviderAppDialogProps {
  open: boolean;
  setup: OAuthSetupRequiredResponse | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: { clientId: string; clientSecret: string; webhookSigningSecret?: string; gmailPubsubTopic?: string; gmailPubsubVerificationToken?: string; name?: string }) => void;
}

export const OAuthProviderAppDialog = ({
  open,
  setup,
  isSubmitting = false,
  onClose,
  onSubmit,
}: OAuthProviderAppDialogProps) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [webhookSigningSecret, setWebhookSigningSecret] = useState('');
  const [gmailPubsubTopic, setGmailPubsubTopic] = useState('');
  const [gmailPubsubVerificationToken, setGmailPubsubVerificationToken] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) {
      setClientId('');
      setClientSecret('');
      setWebhookSigningSecret('');
      setGmailPubsubTopic('');
      setGmailPubsubVerificationToken('');
      setName('');
    }
  }, [open]);

  if (!setup) return null;

  const providerName = setup.providerName || setup.providerKey;

  const handleSubmit = () => {
    onSubmit({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      webhookSigningSecret: webhookSigningSecret.trim() || undefined,
      gmailPubsubTopic: gmailPubsubTopic.trim() || undefined,
      gmailPubsubVerificationToken: gmailPubsubVerificationToken.trim() || undefined,
      name: name.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: radius.md,
        },
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: text.primary,
          }}
        >
          Configure {providerName} OAuth
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16], pt: spacing[4] }}>
          <Alert
            icon={<SecurityIcon fontSize="small" />}
            severity="info"
            sx={{
              bgcolor: alpha(color.functional.info, 0.08),
              color: text.primary,
              '& .MuiAlert-icon': {
                color: color.functional.info,
              },
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm }}>
              {setup.message}
            </Typography>
          </Alert>

          {setup.redirectUri && (
            <TextField
              label="Authorized redirect URI"
              value={setup.redirectUri}
              size="small"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {setup.webhookSupported && setup.webhookUrl && (
            <TextField
              label="Webhook request URL"
              value={setup.webhookUrl}
              size="small"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {setup.providerKey === 'gmail' && setup.gmailPubsubUrl && (
            <TextField
              label="Gmail Pub/Sub push endpoint"
              value={setup.gmailPubsubUrl}
              size="small"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {setup.providerKey === 'gmail' && (
            <TextField
              label="Gmail Pub/Sub topic"
              value={gmailPubsubTopic}
              onChange={(event) => setGmailPubsubTopic(event.target.value)}
              placeholder="projects/YOUR_PROJECT_ID/topics/YOUR_TOPIC_NAME"
              size="small"
              fullWidth
            />
          )}

          <TextField
            label="Display name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`${providerName} OAuth App`}
            size="small"
            fullWidth
          />

          <TextField
            label="Client ID"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            size="small"
            fullWidth
            required
            autoComplete="off"
          />

          <TextField
            label="Client secret"
            value={clientSecret}
            onChange={(event) => setClientSecret(event.target.value)}
            size="small"
            fullWidth
            required
            type="password"
            autoComplete="new-password"
          />

          {setup.webhookSupported && (
            <TextField
              label="Webhook signing secret"
              value={webhookSigningSecret}
              onChange={(event) => setWebhookSigningSecret(event.target.value)}
              size="small"
              fullWidth
              type="password"
              autoComplete="new-password"
            />
          )}

          {setup.providerKey === 'gmail' && (
            <TextField
              label="Pub/Sub verification token"
              value={gmailPubsubVerificationToken}
              onChange={(event) => setGmailPubsubVerificationToken(event.target.value)}
              placeholder="Generated automatically if left blank"
              size="small"
              fullWidth
              type="password"
              autoComplete="new-password"
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: spacing[20], pt: 0 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
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
          onClick={handleSubmit}
          disabled={isSubmitting || clientId.trim() === '' || clientSecret.trim() === ''}
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
        >
          {isSubmitting ? 'Saving...' : 'Save and Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
