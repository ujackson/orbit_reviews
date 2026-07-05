/**
 * Component: BillingSettings
 * 
 * Enterprise billing and subscription management.
 * Stripe-style billing dashboard with usage metrics and invoices.
 */

import { Box, Button, Chip, Typography, LinearProgress, alpha } from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingSection } from '../patterns/SettingSection';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
}

export const BillingSettings = () => {
  const invoices: Invoice[] = [
    {
      id: 'INV-2026-001',
      date: 'Feb 1, 2026',
      amount: '$299.00',
      status: 'paid',
    },
    {
      id: 'INV-2026-002',
      date: 'Jan 1, 2026',
      amount: '$299.00',
      status: 'paid',
    },
    {
      id: 'INV-2025-012',
      date: 'Dec 1, 2025',
      amount: '$299.00',
      status: 'paid',
    },
  ];

  return (
    <Box>
      {/* Current Plan */}
      <SettingSection
        title="Current Plan"
        description="Your subscription and billing details"
        isFirst
      >
        <Box
          sx={{
            p: spacing[24],
            borderRadius: radius.base,
            bgcolor: alpha(color.ai[500], 0.04),
            border: `1px solid ${alpha(color.ai[500], 0.12)}`,
            mb: spacing[24],
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing[16] }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12], mb: spacing[8] }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                  }}
                >
                  Enterprise Plan
                </Typography>
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    bgcolor: alpha(color.functional.success, 0.1),
                    color: color.functional.success,
                    borderRadius: radius.sm,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary, mb: spacing[16] }}>
                $299/month • Billed monthly
              </Typography>
              <Box sx={{ display: 'flex', gap: spacing[24] }}>
                <Box>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                    Next billing date
                  </Typography>
                  <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: text.primary }}>
                    March 1, 2026
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                    Amount due
                  </Typography>
                  <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: text.primary }}>
                    $299.00
                  </Typography>
                </Box>
              </Box>
            </Box>
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
              onClick={() => toast.info('Contact sales@orbit.com to upgrade or change your plan')}
            >
              Change Plan
            </Button>
          </Box>

          {/* Plan Features */}
          <Box
            sx={{
              pt: spacing[16],
              borderTop: `1px solid ${alpha(color.ai[500], 0.12)}`,
              display: 'flex',
              gap: spacing[32],
            }}
          >
            <Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                Team members
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                Unlimited
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                Messages/month
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                Unlimited
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                AI features
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                All included
              </Typography>
            </Box>
          </Box>
        </Box>
      </SettingSection>

      {/* Usage This Month */}
      <SettingSection
        title="Usage This Month"
        description="Track your workspace activity and resource consumption"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[20] }}>
          {/* Active Users */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16], mb: spacing[12] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.primary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PeopleIcon sx={{ fontSize: 20, color: color.functional.primary }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                  Active Users
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                  5 <span style={{ fontSize: typography.fontSize.sm, color: text.tertiary, fontWeight: typography.fontWeight.normal }}>
                    / Unlimited
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Messages Processed */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16], mb: spacing[12] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.info, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageIcon sx={{ fontSize: 20, color: color.functional.info }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                  Messages Processed
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                  12,847 <span style={{ fontSize: typography.fontSize.sm, color: text.tertiary, fontWeight: typography.fontWeight.normal }}>
                    / Unlimited
                  </span>
                </Typography>
              </Box>
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                label="+23%"
                size="small"
                sx={{
                  height: 24,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                  bgcolor: alpha(color.functional.success, 0.1),
                  color: color.functional.success,
                  borderRadius: radius.sm,
                  '& .MuiChip-icon': {
                    color: color.functional.success,
                    marginLeft: spacing[8],
                  },
                }}
              />
            </Box>
          </Box>

          {/* Storage Used */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16], mb: spacing[12] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.ai[500], 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorageIcon sx={{ fontSize: 20, color: color.ai[500] }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
                  Storage Used
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
                  47.2 GB <span style={{ fontSize: typography.fontSize.sm, color: text.tertiary, fontWeight: typography.fontWeight.normal }}>
                    / 1 TB
                  </span>
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={4.72}
              sx={{
                height: 6,
                borderRadius: radius.sm,
                bgcolor: alpha(color.neutral[900], 0.06),
                '& .MuiLinearProgress-bar': {
                  bgcolor: color.ai[500],
                  borderRadius: radius.sm,
                },
              }}
            />
          </Box>
        </Box>
      </SettingSection>

      {/* Payment Method */}
      <SettingSection
        title="Payment Method"
        description="Manage your billing payment method"
      >
        <Box
          sx={{
            p: spacing[20],
            borderRadius: radius.base,
            bgcolor: alpha(color.neutral[900], 0.015),
            border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16] }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: radius.base,
                bgcolor: alpha(color.functional.primary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CreditCardIcon sx={{ fontSize: 24, color: color.functional.primary }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                  mb: spacing[4],
                }}
              >
                Visa ending in 4242
              </Typography>
              <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                Expires 12/2027
              </Typography>
            </Box>
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
              Update
            </Button>
          </Box>
        </Box>
      </SettingSection>

      {/* Billing History */}
      <SettingSection
        title="Billing History"
        description="View and download past invoices"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
          {invoices.map((invoice) => (
            <Box
              key={invoice.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[16],
                p: spacing[16],
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  bgcolor: alpha(color.functional.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ReceiptIcon sx={{ fontSize: 16, color: color.functional.success }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  {invoice.id}
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
                  {invoice.date}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: text.primary,
                }}
              >
                {invoice.amount}
              </Typography>

              <Chip
                label="Paid"
                size="small"
                sx={{
                  height: 20,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                  bgcolor: alpha(color.functional.success, 0.1),
                  color: color.functional.success,
                  borderRadius: radius.sm,
                }}
              />

              <Button
                variant="text"
                size="small"
                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: typography.fontSize.sm,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  color: color.functional.primary,
                  minWidth: 'auto',
                }}
              >
                PDF
              </Button>
            </Box>
          ))}
        </Box>
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection
        title="Danger Zone"
        description="Irreversible actions for your subscription"
      >
        <Box
          sx={{
            p: spacing[20],
            borderRadius: radius.base,
            bgcolor: alpha(color.functional.error, 0.04),
            border: `1px solid ${alpha(color.functional.error, 0.15)}`,
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
            Cancel Subscription
          </Typography>
          <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[16] }}>
            Once you cancel, you'll lose access to all enterprise features at the end of your billing period
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: color.functional.error,
              color: color.functional.error,
              '&:hover': {
                borderColor: color.functional.error,
                bgcolor: alpha(color.functional.error, 0.04),
              },
            }}
          >
            Cancel Subscription
          </Button>
        </Box>
      </SettingSection>
    </Box>
  );
};