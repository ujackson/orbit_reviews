import { Chip as MuiChip, ChipProps as MuiChipProps, alpha } from '@mui/material';
import { color, spacing, typography, radius, transition } from '../../tokens/design-tokens';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ChipSize = 'sm' | 'md';

interface ChipProps extends Omit<MuiChipProps, 'variant' | 'size'> {
  variant?: ChipVariant;
  size?: ChipSize;
}

export const Chip = ({ 
  variant = 'default', 
  size = 'md', 
  label,
  sx = {},
  ...props 
}: ChipProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: alpha(color.functional.primary, 0.1),
          color: color.functional.primary,
        };
      case 'success':
        return {
          bgcolor: alpha(color.functional.success, 0.1),
          color: color.functional.success,
        };
      case 'warning':
        return {
          bgcolor: alpha(color.functional.warning, 0.1),
          color: color.functional.warning,
        };
      case 'error':
        return {
          bgcolor: alpha(color.functional.error, 0.1),
          color: color.functional.error,
        };
      case 'info':
        return {
          bgcolor: alpha(color.functional.info, 0.1),
          color: color.functional.info,
        };
      case 'default':
      default:
        return {
          bgcolor: alpha(color.neutral[900], 0.05),
          color: color.neutral[700],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 18,
          fontSize: typography.fontSize.xs,
          px: spacing[6], // Reduced from [8] to [6] for tighter chips
          py: 0,
        };
      case 'md':
      default:
        return {
          height: 22, // Reduced from 24 for tighter density
          fontSize: typography.fontSize.sm,
          px: spacing[10], // Reduced from [12]
          py: 0,
        };
    }
  };

  return (
    <MuiChip
      label={label}
      sx={{
        borderRadius: radius.sm,
        fontWeight: typography.fontWeight.semibold,
        transition: `all ${transition.duration.fast} ${transition.easing.base}`,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};