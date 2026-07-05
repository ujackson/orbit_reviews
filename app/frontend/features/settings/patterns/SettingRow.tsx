/**
 * Pattern: SettingRow
 * 
 * Reusable setting control row following enterprise structure.
 * No card styling - pure structured row pattern.
 */

import { Box, Typography, Switch, alpha } from '@mui/material';
import { color, spacing, typography, text, radius, transition } from '../../../shared/tokens/design-tokens';

interface SettingRowProps {
  label: string;
  description: string;
  checked?: boolean;
  value?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helperText?: string;
}

export const SettingRow = ({
  label,
  description,
  checked,
  value,
  onChange,
  disabled = false,
  helperText,
}: SettingRowProps) => {
  const resolvedChecked = checked ?? value ?? false;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        py: spacing[16],
        px: spacing[20],
        borderRadius: radius.base,
        transition: `background-color ${transition.duration.fast} ${transition.easing.base}`,
        '&:hover': {
          bgcolor: alpha(color.neutral[900], 0.02), // Subtle hover state
        },
      }}
    >
      {/* Label and description */}
      <Box sx={{ flex: 1, pr: spacing[24] }}>
        <Typography
          sx={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            color: text.primary,
            mb: spacing[4],
            lineHeight: typography.lineHeight.tight,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            color: text.tertiary,
            lineHeight: typography.lineHeight.base,
          }}
        >
          {description}
        </Typography>
        {helperText && (
          <Typography
            sx={{
              fontSize: typography.fontSize.xs,
              color: text.tertiary,
              lineHeight: typography.lineHeight.base,
              mt: spacing[4],
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>

      {/* Toggle control */}
      <Switch
        checked={resolvedChecked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: color.functional.primary,
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            bgcolor: color.functional.primary,
          },
        }}
      />
    </Box>
  );
};
