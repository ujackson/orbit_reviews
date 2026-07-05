import { Box, BoxProps } from '@mui/material';
import { color, elevation, radius, transition } from '../tokens/design-tokens';

export type CardSurfaceVariant = 'elevated' | 'outlined' | 'flat';
export type CardSurfaceLevel = 0 | 1 | 2 | 3;

interface CardSurfaceProps extends Omit<BoxProps, 'component'> {
  variant?: CardSurfaceVariant;
  level?: CardSurfaceLevel;
  interactive?: boolean;
}

export const CardSurface = ({ 
  variant = 'flat', 
  level = 0,
  interactive = false,
  children, 
  sx = {},
  ...props 
}: CardSurfaceProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          boxShadow: elevation[level],
          bgcolor: color.surface.primary,
        };
      case 'outlined':
        return {
          border: '1px solid',
          borderColor: color.neutral[200],
          bgcolor: color.surface.primary,
        };
      case 'flat':
      default:
        return {
          bgcolor: color.surface.primary,
        };
    }
  };

  return (
    <Box
      sx={{
        borderRadius: radius.md,
        transition: `all ${transition.duration.base} ${transition.easing.base}`,
        ...getVariantStyles(),
        ...(interactive && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: elevation[Math.min(level + 1, 3) as CardSurfaceLevel],
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
