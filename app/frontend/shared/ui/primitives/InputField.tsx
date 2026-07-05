import { TextField, TextFieldProps } from '@mui/material';
import { color, spacing, typography, radius, transition, text } from '../../tokens/design-tokens';

export type InputFieldSize = 'sm' | 'md' | 'lg';

interface InputFieldProps extends Omit<TextFieldProps, 'size'> {
  size?: InputFieldSize;
}

export const InputField = ({ 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  error = false,
  sx = {},
  ...props 
}: InputFieldProps) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: typography.fontSize.sm,
          height: 32,
          py: spacing[8],
          px: spacing[12],
        };
      case 'lg':
        return {
          fontSize: typography.fontSize.lg,
          height: 48,
          py: spacing[16],
          px: spacing[16],
        };
      case 'md':
      default:
        return {
          fontSize: typography.fontSize.md,
          height: 40,
          py: spacing[12],
          px: spacing[16],
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TextField
      fullWidth={fullWidth}
      disabled={disabled}
      error={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: radius.base,
          bgcolor: color.surface.primary,
          transition: `all ${transition.duration.fast} ${transition.easing.base}`,
          fontSize: sizeStyles.fontSize,
          
          '& fieldset': {
            borderColor: error ? color.functional.error : color.neutral[200],
            transition: `all ${transition.duration.fast} ${transition.easing.base}`,
          },
          
          '&:hover fieldset': {
            borderColor: error ? color.functional.error : color.neutral[300],
          },
          
          '&.Mui-focused fieldset': {
            borderColor: error ? color.functional.error : color.functional.primary,
            borderWidth: '2px',
          },
          
          '&.Mui-disabled': {
            opacity: 0.4,
            cursor: 'not-allowed',
          },

          '& input': {
            height: 'auto',
            py: 0,
            px: 0,
          },
        },
        
        '& .MuiInputBase-input': {
          color: text.primary,
          '&::placeholder': {
            color: text.secondary,
            opacity: 1,
          },
        },
        
        ...sx,
      }}
      InputProps={{
        sx: {
          py: sizeStyles.py,
          px: sizeStyles.px,
        },
        ...props.InputProps,
      }}
      {...props}
    />
  );
};
