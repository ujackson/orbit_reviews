/**
 * Component: SlidePanel (Orbit Intelligence)
 * 
 * Enterprise slide-over panel with contextual awareness.
 * Not a generic drawer - an intelligent operational interface.
 */

import { Box, IconButton, Typography, alpha, useTheme } from '@mui/material';
import { Close as CloseIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { spacing, typography, text, radius, color } from '../tokens/design-tokens';

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  breadcrumb?: string; // e.g., "Contacts › Add Contact"
  intelligenceTip?: string; // Orbit AI contextual tip
  children: ReactNode;
  width?: number;
}

export const SlidePanel = ({ 
  open, 
  onClose, 
  title, 
  subtitle,
  breadcrumb,
  intelligenceTip,
  children,
  width = 480 
}: SlidePanelProps) => {
  const theme = useTheme();
  
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1300,
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300 
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: `${width}px`,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
              zIndex: 1301,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: spacing[24],
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: spacing[16],
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: subtitle ? spacing[4] : 0,
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.sm,
                      color: text.secondary,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
                {breadcrumb && (
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.sm,
                      color: text.secondary,
                    }}
                  >
                    {breadcrumb}
                  </Typography>
                )}
                {intelligenceTip && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing[8],
                      mt: spacing[12],
                      p: spacing[12],
                      borderRadius: radius.base,
                      bgcolor: alpha(color.ai[500], 0.08),
                      border: `1px solid ${alpha(color.ai[500], 0.12)}`,
                    }}
                  >
                    <AutoAwesomeIcon
                      sx={{
                        fontSize: 16,
                        color: color.ai[600],
                        mt: '2px', // Align with text
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: typography.fontSize.sm,
                        color: color.ai[700],
                        lineHeight: 1.5,
                      }}
                    >
                      {intelligenceTip}
                    </Typography>
                  </Box>
                )}
              </Box>

              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: spacing[24],
              }}
            >
              {children}
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};