import { Box, Typography } from '@mui/material';

// Custom pill toggle — replaces MUI Switch which clips under aggressive ThemeProvider padding overrides.
// States: off = grey track, on = indigo track; thumb is always white circle.

interface PillToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const PillToggle = ({ checked, onChange, disabled = false }: PillToggleProps) => (
  <Box
    component="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    sx={{
      flexShrink: 0,
      width: 36, height: 20,
      borderRadius: '10px',
      border: 'none',
      cursor: disabled ? 'default' : 'pointer',
      bgcolor: checked ? '#5B5FEF' : '#D8DCE5',
      opacity: disabled ? 0.45 : 1,
      position: 'relative',
      transition: 'background-color 0.15s ease',
      outline: 'none',
      '&:focus-visible': {
        boxShadow: '0 0 0 2px #fff, 0 0 0 4px #5B5FEF',
      },
      p: 0,
    }}
  >
    {/* Thumb */}
    <Box sx={{
      position: 'absolute',
      top: '2px',
      left: checked ? '18px' : '2px',
      width: 16, height: 16,
      borderRadius: '50%',
      bgcolor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
      transition: 'left 0.15s ease',
    }} />
  </Box>
);

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
}: SettingRowProps) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    py: '14px', px: '16px', gap: '16px',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' },
  }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#171A21', mb: '2px', lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#9299A6', lineHeight: 1.5 }}>
        {description}
      </Typography>
      {helperText && (
        <Typography sx={{ fontSize: 11, color: '#9299A6', lineHeight: 1.5, mt: '4px' }}>
          {helperText}
        </Typography>
      )}
    </Box>
    <PillToggle checked={checked ?? value ?? false} onChange={onChange} disabled={disabled} />
  </Box>
);
