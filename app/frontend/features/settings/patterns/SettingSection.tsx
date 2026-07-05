/**
 * Pattern: SettingSection
 * 
 * Section container with subtle divider - no heavy styling.
 * Maintains enterprise minimal hierarchy.
 */

import { Box, Typography } from '@mui/material';
import { spacing, typography, text } from '../../../shared/tokens/design-tokens';

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
        borderTop: isFirst ? 'none' : '1px solid #E5E7EB',
      }}
    >
      {/* Section header */}
      <Box sx={{ mb: spacing[16], display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[16] }}>
        <Box>
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
                color: text.secondary,
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
          bgcolor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
