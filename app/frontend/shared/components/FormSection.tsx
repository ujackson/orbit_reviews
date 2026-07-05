/**
 * Component: FormSection (Orbit Intelligence)
 * 
 * Cognitive grouping for enterprise forms.
 * Helps users scan and understand form structure quickly.
 */

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { spacing, typography, text } from '../tokens/design-tokens';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <Box sx={{ mb: spacing[32] }}>
      <Box sx={{ mb: spacing[16] }}>
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: text.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: description ? spacing[4] : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: text.tertiary,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
        {children}
      </Box>
    </Box>
  );
};
