/**
 * Component: IntegrationCard
 * Enterprise integration card with status, metrics, and actions
 */

import { Box, Typography, Chip, Button, alpha } from '@mui/material';
import {
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { IntegrationDefinition, IntegrationConnection } from '../types';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';
import { getMuiIcon } from '../utils/getMuiIcon';

interface IntegrationCardProps {
  integration: IntegrationDefinition;
  connection?: IntegrationConnection;
  onConnect: (integration: IntegrationDefinition) => void;
  onDisconnect?: (connection: IntegrationConnection) => void;
  onSettings?: (connection: IntegrationConnection) => void;
  compact?: boolean;
}

export const IntegrationCard = ({
  integration,
  connection,
  onConnect,
  onDisconnect,
  onSettings,
  compact = false,
}: IntegrationCardProps) => {
  const Icon = getMuiIcon(integration.icon);
  const isConnected = connection?.status === 'connected' || connection?.status === 'syncing';
  const hasError = connection?.status === 'error';

  const getStatusChip = () => {
    if (!connection || connection.status === 'disconnected') return null;

    const configs = {
      connected: {
        icon: <ConnectedIcon sx={{ fontSize: 14 }} />,
        label: 'Connected',
        bgColor: color.functional.success,
      },
      syncing: {
        icon: <ConnectedIcon sx={{ fontSize: 14 }} />,
        label: 'Syncing',
        bgColor: color.functional.info,
      },
      error: {
        icon: <ErrorIcon sx={{ fontSize: 14 }} />,
        label: 'Error',
        bgColor: color.functional.error,
      },
      pending: {
        icon: undefined,
        label: 'Connecting...',
        bgColor: color.functional.info,
      },
    };

    const config = configs[connection.status];
    if (!config) return null;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          height: 20,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          bgcolor: alpha(config.bgColor, 0.1),
          color: config.bgColor,
          borderRadius: radius.sm,
          '& .MuiChip-icon': {
            color: config.bgColor,
            marginLeft: spacing[8],
          },
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[16],
        p: compact ? spacing[16] : spacing[20],
        borderRadius: radius.base,
        bgcolor: alpha(color.neutral[900], 0.015),
        border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
        transition: 'all 0.12s ease-out',
        '&:hover': {
          bgcolor: alpha(color.neutral[900], 0.025),
          borderColor: alpha(color.neutral[900], 0.12),
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          borderRadius: radius.base,
          bgcolor: alpha(integration.color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: integration.color,
          fontSize: compact ? 20 : 24,
        }}
      >
        <Icon sx={{ fontSize: 'inherit' }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[4] }}>
          <Typography
            sx={{
              fontSize: compact ? typography.fontSize.sm : typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: text.primary,
            }}
          >
            {integration.name}
          </Typography>
          {getStatusChip()}
          {integration.popular && !isConnected && (
            <Chip
              label="Popular"
              size="small"
              sx={{
                height: 18,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                bgcolor: alpha(color.ai[500], 0.1),
                color: color.ai[700],
                borderRadius: radius.sm,
              }}
            />
          )}
        </Box>

        <Typography
          sx={{
            fontSize: compact ? typography.fontSize.xs : typography.fontSize.sm,
            color: text.secondary,
            mb: !compact && isConnected ? spacing[8] : 0,
          }}
        >
          {integration.description}
        </Typography>

        {/* Metrics for connected integrations */}
        {!compact && isConnected && connection && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16], mt: spacing[8] }}>
            {connection.lastSync && (
              <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                Last sync: {connection.lastSync}
              </Typography>
            )}
            {connection.messagesCount !== undefined && (
              <>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    bgcolor: text.tertiary,
                  }}
                />
                <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                  {connection.messagesCount.toLocaleString()} messages
                </Typography>
              </>
            )}
            {connection.accountName && (
              <>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    bgcolor: text.tertiary,
                  }}
                />
                <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                  {connection.accountName}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Error message */}
        {hasError && connection?.error && (
          <Typography
            sx={{
              fontSize: typography.fontSize.xs,
              color: color.functional.error,
              fontWeight: typography.fontWeight.medium,
              mt: spacing[8],
            }}
          >
            {connection.error}
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: spacing[8], flexShrink: 0 }}>
        {isConnected ? (
          <>
            {integration.docsUrl && (
              <Button
                variant="text"
                size="small"
                endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                onClick={() => window.open(integration.docsUrl, '_blank')}
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  color: text.tertiary,
                  minWidth: 'auto',
                  display: compact ? 'none' : 'inline-flex',
                  '&:hover': {
                    bgcolor: alpha(color.neutral[900], 0.04),
                    color: text.primary,
                  },
                }}
              >
                Docs
              </Button>
            )}
            {onSettings && connection && (
              <Button
                variant="text"
                size="small"
                onClick={() => onSettings(connection)}
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  color: text.tertiary,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: alpha(color.neutral[900], 0.04),
                    color: text.primary,
                  },
                }}
              >
                Settings
              </Button>
            )}
            {onDisconnect && connection && (
              <Button
                variant="text"
                size="small"
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  color: color.functional.error,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: alpha(color.functional.error, 0.04),
                  },
                }}
                onClick={() => onDisconnect(connection)}
              >
                Disconnect
              </Button>
            )}
          </>
        ) : (
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
            onClick={() => onConnect(integration)}
          >
            Connect
          </Button>
        )}
      </Box>
    </Box>
  );
};
