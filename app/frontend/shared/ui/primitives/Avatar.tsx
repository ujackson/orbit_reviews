import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps, alpha } from '@mui/material';
import { color, typography } from '../../tokens/design-tokens';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<MuiAvatarProps, 'size'> {
  size?: AvatarSize;
  accentColor?: string;
  children?: React.ReactNode;
}

export const Avatar = ({ 
  size = 'md', 
  accentColor = color.functional.primary,
  children,
  sx = {},
  ...props 
}: AvatarProps) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          width: 24,
          height: 24,
          fontSize: typography.fontSize.xs,
        };
      case 'sm':
        return {
          width: 32,
          height: 32,
          fontSize: typography.fontSize.sm,
        };
      case 'lg':
        return {
          width: 56,
          height: 56,
          fontSize: typography.fontSize.xl,
        };
      case 'xl':
        return {
          width: 72,
          height: 72,
          fontSize: typography.fontSize.xxl,
        };
      case 'md':
      default:
        return {
          width: 40,
          height: 40,
          fontSize: typography.fontSize.md,
        };
    }
  };

  return (
    <MuiAvatar
      sx={{
        bgcolor: alpha(accentColor, 0.15),
        color: accentColor,
        fontWeight: typography.fontWeight.semibold,
        ...getSizeStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
};
