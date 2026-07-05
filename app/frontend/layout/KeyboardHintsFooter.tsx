import { Box, Typography, Chip, alpha } from '@mui/material';
import { motion } from 'motion/react';
import { color, spacing, typography, radius } from '@/shared/tokens/design-tokens.ts';

interface KeyboardShortcut {
  key: string;
  label: string;
}

interface KeyboardHintsFooterProps {
  shortcuts?: KeyboardShortcut[];
}

export const KeyboardHintsFooter = ({ 
  shortcuts = [
    { key: '⌘K', label: 'Command' },
    { key: 'J/K', label: 'Navigate' },
    { key: 'Enter', label: 'Open' },
    { key: 'E', label: 'Assign' },
    { key: 'C', label: 'Close' },
    { key: 'R', label: 'Pending' },
  ]
}: KeyboardHintsFooterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.3 }}
    >
      <Box
        sx={{
          px: spacing[24], // Match thread container padding
          py: spacing[10], // Slightly more vertical padding for breathing room
          mb: spacing[12], // Breathing room from window edge - CRITICAL
          mx: spacing[24], // Inset from thread edges - creates architectural alignment
          borderTop: `1px solid ${alpha(color.neutral[900], 0.06)}`, // Subtle chrome divider
          bgcolor: alpha(color.neutral[100], 0.30), // Further reduced from 0.4 - whisper, not call to action
          backdropFilter: 'blur(8px)',
          borderRadius: radius.sm, // Subtle rounding to feel like a component, not a raw edge
          display: 'flex',
          alignItems: 'center',
          gap: spacing[20],
          justifyContent: 'center',
        }}
      >
        {shortcuts.map((shortcut, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing[8],
            }}
          >
            <Chip
              label={shortcut.key}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: typography.fontWeight.semibold,
                bgcolor: alpha(color.neutral[900], 0.04), // Reduced from 0.06 - softer
                color: color.neutral[600], // Reduced from 700 - less intense
                border: `1px solid ${alpha(color.neutral[900], 0.06)}`, // Reduced from 0.08
                fontFamily: typography.fontFamily.mono,
                px: spacing[8],
                boxShadow: 'none', // Removed shadow entirely
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: color.neutral[500], // Reduced from 600 - quieter
                fontSize: 11,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {shortcut.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
};
