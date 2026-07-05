import { ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useUIStore } from '@/stores/uiStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useUIStore((state) => state.theme);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: '#5E6AD2',
            light: '#8A94E8',
            dark: '#4A54B0',
          },
          background: {
            default: theme === 'light' ? '#F8F9FA' : '#0D0D0D',
            paper: theme === 'light' ? '#FFFFFF' : '#1A1A1A',
          },
          text: {
            primary: theme === 'light' ? '#1A1A1A' : '#FFFFFF',
            secondary: theme === 'light' ? '#6B6B6B' : '#A0A0A0',
          },
          divider: theme === 'light' ? '#E5E7EB' : '#2A2A2A',
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 12,
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                overflow: 'hidden',
              },
            },
          },
        },
      }),
    [theme]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
