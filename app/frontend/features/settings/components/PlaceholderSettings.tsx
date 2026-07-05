/**
 * Component: PlaceholderSettings
 * 
 * Placeholder for unbuilt settings sections.
 */

import { Box, Typography } from '@mui/material';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';

interface PlaceholderSettingsProps {
  title: string;
  description: string;
}

export const PlaceholderSettings = ({ title, description }: PlaceholderSettingsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        bgcolor: color.surface.work,
        borderRadius: radius.base,
        border: `1px dashed ${color.neutral[200]}`,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400, px: spacing[24] }}>
        <Typography
          sx={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: text.primary,
            mb: spacing[8],
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            color: text.tertiary,
            lineHeight: typography.lineHeight.base,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
};
