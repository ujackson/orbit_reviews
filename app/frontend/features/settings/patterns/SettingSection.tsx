/**
 * Pattern: SettingSection
 * 
 * Section container with subtle divider - no heavy styling.
 * Maintains enterprise minimal hierarchy.
 */

import { Box, Typography, alpha } from '@mui/material';
import { color, spacing, typography, text } from '../../../shared/tokens/design-tokens';

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isFirst?: boolean;
  action?: React.ReactNode;
}

export const SettingSection = ({
  title,
  description,
  children,
  isFirst = false,
  action,
}: SettingSectionProps) => {
  return (
    <Box
      sx={{
        pt: isFirst ? 0 : spacing[32],
        mt: isFirst ? 0 : spacing[32],
        borderTop: isFirst ? 'none' : `1px solid ${alpha(color.neutral[900], 0.06)}`, // Subtle tonal divider
      }}
    >
      {/* Section header */}
      <Box sx={{ mb: spacing[16], display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[16] }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: text.primary,
              mb: spacing[4],
              lineHeight: typography.lineHeight.tight,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                color: text.tertiary,
                lineHeight: typography.lineHeight.base,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Box>

      {/* Section content */}
      <Box
        sx={{
          bgcolor: color.surface.work, // Layer 3 - Work surface
          borderRadius: '8px',
          border: `1px solid ${alpha(color.neutral[900], 0.04)}`, // Minimal tonal border
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
