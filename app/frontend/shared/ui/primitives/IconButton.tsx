import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps, alpha } from '@mui/material';
import { color, radius, transition, text } from '../../tokens/design-tokens';

export type IconButtonVariant = 'default' | 'primary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends Omit<MuiIconButtonProps, 'size'> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export const IconButton = ({ 
  variant = 'default', 
  size = 'md', 
  children, 
  disabled = false,
  sx = {},
  ...props 
}: IconButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          color: color.functional.primary,
          bgcolor: alpha(color.functional.primary, 0.08),
          '&:hover': {
            bgcolor: alpha(color.functional.primary, 0.12),
          },
          '&:active': {
            bgcolor: alpha(color.functional.primary, 0.16),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.functional.primary}`,
            outlineOffset: '2px',
          },
        };
      case 'ghost':
        return {
          color: text.secondary,
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: alpha(color.neutral[900], 0.04),
            color: text.primary,
          },
          '&:active': {
            bgcolor: alpha(color.neutral[900], 0.06),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.neutral[400]}`,
            outlineOffset: '2px',
          },
        };
      case 'default':
      default:
        return {
          color: text.secondary,
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: alpha(color.neutral[900], 0.04),
          },
          '&:active': {
            bgcolor: alpha(color.neutral[900], 0.06),
          },
          '&:focus-visible': {
            outline: `2px solid ${color.neutral[400]}`,
            outlineOffset: '2px',
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: 32,
          height: 32,
          fontSize: 16,
        };
      case 'lg':
        return {
          width: 48,
          height: 48,
          fontSize: 24,
        };
      case 'md':
      default:
        return {
          width: 40,
          height: 40,
          fontSize: 20,
        };
    }
  };

  return (
    <MuiIconButton
      disabled={disabled}
      sx={{
        borderRadius: radius.base,
        transition: `all ${transition.duration.fast} ${transition.easing.base}`,
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
    </MuiIconButton>
  );
};
