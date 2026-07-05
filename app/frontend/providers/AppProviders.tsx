import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../bootstrap/queryClient';
import { WorkspaceProvider } from './WorkspaceProvider';
import { AuthProvider } from './AuthProvider';
import { KeyboardProvider } from './KeyboardProvider';
import { RealtimeProvider } from './RealtimeProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { useFlashToast } from '@/hooks/useFlashToast';

interface AppProvidersProps {
  children: ReactNode;
  [key: string]: unknown;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  useFlashToast();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <KeyboardProvider>
              <RealtimeProvider>
                {children}
                <ToastProvider />
              </RealtimeProvider>
            </KeyboardProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
