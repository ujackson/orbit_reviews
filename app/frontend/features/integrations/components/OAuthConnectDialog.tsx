/**
 * Component: OAuthConnectDialog
 * Enterprise OAuth connection flow with scope permissions display
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { IntegrationDefinition } from '../types';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';
import { getMuiIcon } from '../utils/getMuiIcon';

interface OAuthConnectDialogProps {
  open: boolean;
  integration: IntegrationDefinition | null;
  onClose: () => void;
  onConnect: (integrationId: string, accountInfo?: any) => void;
}

// Scope descriptions for common OAuth scopes
const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'gmail.readonly': 'Read your email messages and settings',
  'gmail.send': 'Send emails on your behalf',
  'gmail.modify': 'Manage your email (read, write, delete)',
  'Mail.Read': 'Read your email',
  'Mail.Send': 'Send email as you',
  'Mail.ReadWrite': 'Read and write access to your email',
  'channels:read': 'View information about channels',
  'channels:history': 'View messages and other content in public channels',
  'chat:write': 'Post messages to channels',
  'users:read': 'View user information',
  'Chat.Read': 'Read your chat messages',
  'Chat.ReadWrite': 'Read and write chat messages',
  'calendar.readonly': 'View your calendar',
  'calendar.events': 'Manage your calendar events',
  'Calendars.Read': 'Read your calendars',
  'Calendars.ReadWrite': 'Read and write your calendars',
  'api': 'Access Salesforce API',
  'refresh_token': 'Maintain connection when you\'re not using the app',
  'crm.objects.contacts.read': 'Read your contacts',
  'crm.objects.deals.read': 'Read your deals',
  'repo': 'Access your repositories',
  'read:user': 'Read your user profile',
};

export const OAuthConnectDialog = ({
  open,
  integration,
  onClose,
  onConnect,
}: OAuthConnectDialogProps) => {
  if (!integration) return null;

  const Icon = getMuiIcon(integration.icon);

  const handleConnect = () => {
    onConnect(integration.id);
    onClose();
  };

  const getScopeDescription = (scope: string): string => {
    return SCOPE_DESCRIPTIONS[scope] || scope;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: radius.md,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16] }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: radius.base,
              bgcolor: alpha(integration.color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: integration.color,
              fontSize: 24,
            }}
          >
            <Icon sx={{ fontSize: 'inherit' }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: text.primary,
              }}
            >
              Connect {integration.name}
            </Typography>
            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                color: text.secondary,
              }}
            >
              via {integration.oauthProvider || 'OAuth'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[24] }}>
          {/* Description */}
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: text.secondary,
            }}
          >
            {integration.description}
          </Typography>

          {/* Security notice */}
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
              You'll be redirected to {integration.oauthProvider || integration.name} to authorize
              Orbit. Orbit stores authorized tokens securely on the server and never exposes them
              in the browser.
            </Typography>
          </Alert>

          {/* Permissions */}
          {integration.scopes && integration.scopes.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                  mb: spacing[12],
                }}
              >
                Orbit will be able to:
              </Typography>
              <List sx={{ p: 0 }}>
                {integration.scopes.map((scope, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      px: 0,
                      py: spacing[8],
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon
                        sx={{
                          fontSize: 18,
                          color: color.functional.success,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={getScopeDescription(scope)}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: typography.fontSize.sm,
                          color: text.primary,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Documentation link */}
          {integration.docsUrl && (
            <Button
              variant="text"
              size="small"
              endIcon={<OpenIcon sx={{ fontSize: 14 }} />}
              onClick={() => window.open(integration.docsUrl, '_blank')}
              sx={{
                fontSize: typography.fontSize.sm,
                textTransform: 'none',
                fontWeight: typography.fontWeight.medium,
                color: color.functional.primary,
                alignSelf: 'flex-start',
                px: 0,
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              View integration documentation
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: spacing[20], pt: 0 }}>
        <Button
          variant="outlined"
          onClick={onClose}
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
          onClick={handleConnect}
          sx={{
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            bgcolor: color.functional.primary,
            color: '#FFFFFF',
            minWidth: 120,
            '&:hover': {
              bgcolor: color.functional.primaryHover,
            },
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
