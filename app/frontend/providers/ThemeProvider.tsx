import { ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material';
import { useUIStore } from '../stores/uiStore';

// ─── Orbit Reviews design palette ─────────────────────────────────────────────
// Purple is reserved for: active nav, primary CTA, selected state, brand moments.
// Not used for AI decoration, generic cards, or backgrounds.

const PALETTE = {
  brand:     '#5B5BD6',
  brandHover:'#4F46E5',
  bg:        '#FAFAFA',
  surface:   '#FFFFFF',
  sidebar:   '#F8F8F8',
  border:    '#E5E7EB',
  borderSub: 'rgba(0,0,0,0.06)',
  textPrimary:   '#111827',
  textSecondary: '#4B5563',
  textMuted:     '#6B7280',
  success:   '#059669',
  warning:   '#D97706',
  danger:    '#DC2626',
  info:      '#2563EB',
} as const;

interface ThemeProviderProps { children: ReactNode }

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const mode = useUIStore((state) => state.theme);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary:    { main: PALETTE.brand, dark: PALETTE.brandHover, contrastText: '#fff' },
      error:      { main: PALETTE.danger,   contrastText: '#fff' },
      warning:    { main: PALETTE.warning,  contrastText: '#fff' },
      success:    { main: PALETTE.success,  contrastText: '#fff' },
      info:       { main: PALETTE.info,     contrastText: '#fff' },
      background: {
        default: mode === 'light' ? PALETTE.bg      : '#0C0C0E',
        paper:   mode === 'light' ? PALETTE.surface : '#161618',
      },
      text: {
        primary:   mode === 'light' ? PALETTE.textPrimary   : '#F3F4F6',
        secondary: mode === 'light' ? PALETTE.textSecondary : '#9CA3AF',
        disabled:  mode === 'light' ? '#D1D5DB'             : '#4B5563',
      },
      divider: mode === 'light' ? PALETTE.border : 'rgba(255,255,255,0.08)',
    },

    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 13,
      fontWeightRegular: 400,
      fontWeightMedium:  500,
      fontWeightBold:    700,
      // Headings
      h1: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em',  lineHeight: 1.25 },
      h3: { fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',  lineHeight: 1.35 },
      h4: { fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.4 },
      h5: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: 12, fontWeight: 600, lineHeight: 1.4 },
      // Body
      body1: { fontSize: 14, lineHeight: 1.55 },
      body2: { fontSize: 13, lineHeight: 1.55 },
      caption: { fontSize: 12, lineHeight: 1.5 },
      overline: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.5, textTransform: 'uppercase' },
      // Button text
      button: { fontSize: 13, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    },

    shape: { borderRadius: 6 },

    shadows: [
      'none',
      '0 1px 2px rgba(0,0,0,0.05)',
      '0 1px 4px rgba(0,0,0,0.07)',
      '0 2px 8px rgba(0,0,0,0.08)',
      '0 4px 12px rgba(0,0,0,0.09)',
      '0 8px 24px rgba(0,0,0,0.10)',
      '0 12px 40px rgba(0,0,0,0.12)',
      '0 16px 48px rgba(0,0,0,0.14)',
      ...Array(17).fill('none'),
    ] as any,

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body': {
            overflow: 'hidden',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '*': { boxSizing: 'border-box' },
          '::-webkit-scrollbar': { width: 5, height: 5 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.14)', borderRadius: 10 },
          '::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.22)' },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: 6,
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: 0,
            lineHeight: 1,
            padding:
              ownerState.size === 'small' ? '5px 10px' :
              ownerState.size === 'large' ? '10px 20px' : '7px 14px',
            fontSize: ownerState.size === 'small' ? 12 : 13,
            transition: 'background-color 0.10s, box-shadow 0.10s, border-color 0.10s',
            '&:active': { transform: 'scale(0.985)' },
          }),
          contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          outlined: {
            borderColor: PALETTE.border,
            color: PALETTE.textSecondary,
            '&:hover': {
              borderColor: '#D1D5DB',
              backgroundColor: 'rgba(0,0,0,0.03)',
            },
          },
          text: { '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } },
        },
      },

      MuiIconButton: {
        defaultProps: { disableRipple: false },
        styleOverrides: {
          root: { borderRadius: 6, transition: 'background-color 0.10s' },
          sizeSmall: { padding: 4 },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 8,
          },
          elevation0: { boxShadow: 'none' },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 4, fontWeight: 500, fontSize: 11 },
          sizeSmall: { height: 20, fontSize: 11 },
          label: { padding: '0 8px' },
          labelSmall: { padding: '0 6px' },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              fontSize: 13,
              backgroundColor: PALETTE.surface,
              '& fieldset': { borderColor: PALETTE.border },
              '&:hover fieldset': { borderColor: '#D1D5DB' },
              '&.Mui-focused fieldset': { borderColor: PALETTE.brand, borderWidth: 1.5 },
            },
            '& .MuiInputLabel-root': { fontSize: 13 },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 6, fontSize: 13 },
          outlined: {
            '& .MuiOutlinedInput-notchedOutline': { borderColor: PALETTE.border },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: `1px solid ${PALETTE.border}`,
          },
          backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
        },
      },

      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: 14, fontWeight: 700, padding: '18px 24px 10px' } },
      },
      MuiDialogContent: {
        styleOverrides: { root: { padding: '0 24px 18px', fontSize: 13 } },
      },
      MuiDialogActions: {
        styleOverrides: { root: { padding: '10px 24px 18px', gap: 8 } },
      },

      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 350 },
        styleOverrides: {
          tooltip: {
            fontSize: 11, fontWeight: 500,
            backgroundColor: '#1F2937',
            color: '#F9FAFB',
            borderRadius: 5,
            padding: '4px 8px',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13, borderRadius: 4,
            margin: '1px 4px', padding: '6px 10px',
            minHeight: 'auto',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6, padding: '5px 10px',
            '&.Mui-selected': { backgroundColor: alpha(PALETTE.brand, 0.08) },
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none', fontWeight: 500,
            fontSize: 13, minHeight: 40, padding: '0 4px',
            marginRight: 16, color: PALETTE.textSecondary,
            '&.Mui-selected': { fontWeight: 700, color: PALETTE.textPrimary },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: '2px 2px 0 0',
            backgroundColor: PALETTE.brand,
          },
        },
      },

      MuiDivider: {
        styleOverrides: { root: { borderColor: PALETTE.border } },
      },

      MuiSwitch: {
        styleOverrides: {
          root: { padding: 0, width: 36, height: 20 },
          thumb: { width: 16, height: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
          track: {
            borderRadius: 10,
            opacity: '1 !important',
            backgroundColor: '#D1D5DB',
          },
          switchBase: {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              '& + .MuiSwitch-track': { backgroundColor: PALETTE.brand },
            },
          },
        },
      },

      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${PALETTE.border}`,
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { minHeight: 0, padding: '0 12px', '& .MuiAccordionSummary-content': { margin: '10px 0' } },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: { root: { padding: '0 12px 12px' } },
      },

      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 3 }, bar: { borderRadius: 3 } },
      },

      MuiRating: {
        styleOverrides: { iconFilled: { color: '#F59E0B' } },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            border: `1px solid ${PALETTE.border}`,
            padding: '4px',
          },
          list: { padding: 0 },
        },
      },

      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: 11, marginLeft: 0 } },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontSize: 13 }, shrink: { fontSize: 13 } },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: '#D1D5DB',
            '&.Mui-checked': { color: PALETTE.brand },
            padding: 4,
          },
        },
      },
      MuiRadio: {
        styleOverrides: { root: { '&.Mui-checked': { color: PALETTE.brand }, padding: 4 } },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: alpha(PALETTE.brand, 0.12),
            color: PALETTE.brand,
          },
        },
      },
    },
  }), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
