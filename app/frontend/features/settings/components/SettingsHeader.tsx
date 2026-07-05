/**
 * Component: SettingsHeader
 * 
 * Page header with title and description - minimal enterprise style.
 */

import { Box, Typography } from '@mui/material';
import { spacing, typography, text } from '../../../shared/tokens/design-tokens';

interface SettingsHeaderProps {
  title: string;
  description: string;
}

export const SettingsHeader = ({ title, description }: SettingsHeaderProps) => {
  return (
    <Box sx={{ mb: spacing[32] }}>
      <Typography
        sx={{
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.semibold,
          color: text.primary,
          mb: spacing[8],
          lineHeight: typography.lineHeight.tight,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: typography.fontSize.md,
          color: text.tertiary,
          lineHeight: typography.lineHeight.base,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};
