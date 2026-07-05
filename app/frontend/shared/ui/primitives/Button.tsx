import { Button as MuiButton, ButtonProps as MuiButtonProps, alpha } from '@mui/material';
import { color, spacing, typography, radius, transition } from '../../tokens/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  disabled = false,
  sx = {},
  ...props 
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: color.functional.primary,
          color: color.neutral[0],
          '&:hover': {
            bgcolor: color.functional.primaryHover,
            boxShadow: `0 4px 12px ${alpha(color.functional.primary, 0.3)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:focus-visible': {
            outline: `2px solid ${color.functional.primary}`,
            outlineOffset: '2px',
          },
        };
      case 'secondary':
        return {
          bgcolor: alpha(color.neutral[900], 0.05),
          color: color.neutral[900],
          '&:hover': {
            bgcolor: alpha(color.neutral[900], 0.08),
          },
          '&:active': {
            bgcolor: alpha(color.neutral[900], 0.1),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.neutral[400]}`,
            outlineOffset: '2px',
          },
        };
      case 'outline':
        return {
          bgcolor: 'transparent',
          border: `1px solid ${color.neutral[300]}`,
          color: color.neutral[900],
          '&:hover': {
            bgcolor: alpha(color.neutral[900], 0.04),
            borderColor: color.functional.primary,
          },
          '&:active': {
            bgcolor: alpha(color.neutral[900], 0.06),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.functional.primary}`,
            outlineOffset: '2px',
          },
        };
      case 'ghost':
        return {
          bgcolor: 'transparent',
          color: color.neutral[600],
          '&:hover': {
            bgcolor: alpha(color.neutral[900], 0.04),
            color: color.neutral[900],
          },
          '&:active': {
            bgcolor: alpha(color.neutral[900], 0.06),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.neutral[400]}`,
            outlineOffset: '2px',
          },
        };
      case 'danger':
        return {
          bgcolor: color.functional.error,
          color: color.neutral[0],
          '&:hover': {
            bgcolor: alpha(color.functional.error, 0.9),
            boxShadow: `0 4px 12px ${alpha(color.functional.error, 0.3)}`,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:focus-visible': {
            outline: `2px solid ${color.functional.error}`,
            outlineOffset: '2px',
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          px: spacing[12],
          py: spacing[8],
          fontSize: typography.fontSize.sm,
          height: 32,
        };
      case 'lg':
        return {
          px: spacing[24],
          py: spacing[16],
          fontSize: typography.fontSize.lg,
          height: 48,
        };
      case 'md':
      default:
        return {
          px: spacing[16],
          py: spacing[12],
          fontSize: typography.fontSize.md,
          height: 40,
        };
    }
  };

  return (
    <MuiButton
      disableElevation
      disabled={disabled}
      sx={{
        borderRadius: radius.base,
        textTransform: 'none',
        fontWeight: typography.fontWeight.medium,
        transition: `all ${transition.duration.fast} ${transition.easing.base}`,
        boxShadow: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        '&.Mui-disabled': {
          opacity: 0.4,
          cursor: 'not-allowed',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
