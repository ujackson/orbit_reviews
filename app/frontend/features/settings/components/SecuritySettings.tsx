/**
 * Component: SecuritySettings
 * 
 * Enterprise security controls - SSO, MFA, audit logs, data retention.
 * Stripe/AWS-style security dashboard with clear status indicators.
 */

import { Box, Button, Chip, Typography, alpha } from '@mui/material';
import {
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  VpnKey as KeyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { SettingSection } from '../patterns/SettingSection';
import { SettingRow } from '../patterns/SettingRow';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';
import { useState } from 'react';

export const SecuritySettings = () => {
  // Security toggles
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [exportControls, setExportControls] = useState(true);

  const securityEvents = [
    {
      id: '1',
      event: 'User login',
      user: 'sarah.chen@orbit.com',
      timestamp: '2 minutes ago',
      status: 'success' as const,
    },
    {
      id: '2',
      event: 'API key created',
      user: 'michael.r@orbit.com',
      timestamp: '1 hour ago',
      status: 'success' as const,
    },
    {
      id: '3',
      event: 'Failed login attempt',
      user: 'unknown@example.com',
      timestamp: '3 hours ago',
      status: 'warning' as const,
    },
    {
      id: '4',
      event: 'Integration connected',
      user: 'sarah.chen@orbit.com',
      timestamp: '5 hours ago',
      status: 'success' as const,
    },
  ];

  return (
    <Box>
      {/* Authentication */}
      <SettingSection
        title="Authentication"
        description="Control how users authenticate to your workspace"
        isFirst
      >
        {/* SSO Status */}
        <Box
          sx={{
            p: spacing[20],
            borderRadius: radius.base,
            bgcolor: alpha(color.neutral[900], 0.015),
            border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            mb: spacing[16],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: radius.base,
                bgcolor: alpha(color.functional.warning, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <KeyIcon sx={{ fontSize: 24, color: color.functional.warning }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[4] }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                  }}
                >
                  Single Sign-On (SSO)
                </Typography>
                <Chip
                  label="Not Configured"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    bgcolor: alpha(color.functional.warning, 0.1),
                    color: color.functional.warning,
                    borderRadius: radius.sm,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[16] }}>
                Enable SAML 2.0 or OAuth 2.0 authentication for enterprise identity providers
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  borderColor: alpha(color.neutral[900], 0.12),
                  color: text.primary,
                }}
              >
                Configure SSO
              </Button>
            </Box>
          </Box>
        </Box>

        <SettingRow
          label="Require multi-factor authentication"
          description="All workspace members must enable MFA"
          value={mfaRequired}
          onChange={setMfaRequired}
        />
        <SettingRow
          label="Automatic session timeout"
          description="Sign out inactive users after 8 hours"
          value={sessionTimeout}
          onChange={setSessionTimeout}
        />
        <SettingRow
          label="IP address whitelist"
          description="Restrict access to specific IP addresses"
          value={ipWhitelist}
          onChange={setIpWhitelist}
        />
      </SettingSection>

      {/* Data Protection */}
      <SettingSection
        title="Data Protection"
        description="Configure encryption and data retention policies"
      >
        <SettingRow
          label="End-to-end encryption"
          description="Encrypt all messages and attachments at rest"
          value={dataEncryption}
          onChange={setDataEncryption}
          disabled
          helperText="Required for all Enterprise workspaces"
        />
        <SettingRow
          label="Audit logging"
          description="Track all user actions and security events"
          value={auditLogging}
          onChange={setAuditLogging}
        />
        <SettingRow
          label="Export controls"
          description="Require approval for data exports"
          value={exportControls}
          onChange={setExportControls}
        />

        {/* Data Retention */}
        <Box
          sx={{
            mt: spacing[24],
            p: spacing[20],
            borderRadius: radius.base,
            bgcolor: alpha(color.neutral[900], 0.015),
            border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: text.primary,
              mb: spacing[4],
            }}
          >
            Data Retention Policy
          </Typography>
          <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[16] }}>
            Automatically delete conversations and messages after a specified period
          </Typography>
          <Box sx={{ display: 'flex', gap: spacing[12] }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: typography.fontSize.sm,
                textTransform: 'none',
                fontWeight: typography.fontWeight.medium,
                borderColor: alpha(color.neutral[900], 0.12),
                color: text.primary,
              }}
            >
              Configure Retention
            </Button>
            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                color: text.tertiary,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Current policy: <strong style={{ marginLeft: spacing[4], color: text.primary }}>Keep forever</strong>
            </Typography>
          </Box>
        </Box>
      </SettingSection>

      {/* Audit Log */}
      <SettingSection
        title="Audit Log"
        description="Review recent security and access events"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.12),
              color: text.primary,
            }}
          >
            Export Logs
          </Button>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
          {securityEvents.map((event) => (
            <Box
              key={event.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[16],
                p: spacing[16],
                borderRadius: radius.base,
                bgcolor: alpha(color.neutral[900], 0.015),
                border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
              }}
            >
              {/* Status Icon */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(
                    event.status === 'success' ? color.functional.success : color.functional.warning,
                    0.1
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {event.status === 'success' ? (
                  <VerifiedIcon
                    sx={{
                      fontSize: 16,
                      color: color.functional.success,
                    }}
                  />
                ) : (
                  <WarningIcon
                    sx={{
                      fontSize: 16,
                      color: color.functional.warning,
                    }}
                  />
                )}
              </Box>

              {/* Event Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  {event.event}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16] }}>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                    {event.user}
                  </Typography>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      bgcolor: text.tertiary,
                    }}
                  />
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary }}>
                    {event.timestamp}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Button
          variant="text"
          sx={{
            mt: spacing[16],
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            color: color.functional.primary,
          }}
        >
          View All Audit Logs
        </Button>
      </SettingSection>

      {/* Security Recommendations */}
      <SettingSection
        title="Security Recommendations"
        description="Improve your workspace security posture"
      >
        <Box
          sx={{
            p: spacing[20],
            borderRadius: radius.base,
            bgcolor: alpha(color.functional.warning, 0.05),
            border: `1px solid ${alpha(color.functional.warning, 0.15)}`,
          }}
        >
          <Box sx={{ display: 'flex', gap: spacing[16] }}>
            <WarningIcon sx={{ fontSize: 24, color: color.functional.warning, flexShrink: 0 }} />
            <Box>
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                  mb: spacing[8],
                }}
              >
                2 security improvements recommended
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
                <Box>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.primary, mb: spacing[4] }}>
                    • Enable SSO for enterprise authentication
                  </Typography>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                    Centralize access control and improve security
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.primary, mb: spacing[4] }}>
                    • Require multi-factor authentication
                  </Typography>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                    Add an extra layer of security for all users
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </SettingSection>

      {/* Compliance */}
      <SettingSection
        title="Compliance"
        description="Data privacy and regulatory compliance"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[12] }}>
              <VerifiedIcon sx={{ fontSize: 20, color: color.functional.success }} />
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                }}
              >
                GDPR Compliant
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              Your workspace meets EU General Data Protection Regulation requirements
            </Typography>
          </Box>

          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[12] }}>
              <VerifiedIcon sx={{ fontSize: 20, color: color.functional.success }} />
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                }}
              >
                SOC 2 Type II Certified
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              Orbit infrastructure is independently audited for security controls
            </Typography>
          </Box>
        </Box>
      </SettingSection>
    </Box>
  );
};
