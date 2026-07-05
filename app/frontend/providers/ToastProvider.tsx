/**
 * Component: ToastProvider
 * 
 * Enterprise toast notification system using Sonner.
 * Operational style - clear, informative, never playful.
 */

import { Toaster } from 'sonner';
import { color, typography } from '@/shared/tokens/design-tokens';

export const ToastProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: typography.fontFamily.base,
          fontSize: typography.fontSize.base,
          background: color.surface.primary,
          color: color.neutral[900],
          border: `1px solid ${color.neutral[200]}`,
          borderRadius: '6px',
          padding: '12px 16px',
        },
        className: 'enterprise-toast',
      }}
      duration={3000}
    />
  );
};
