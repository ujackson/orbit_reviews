import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import type { FlashData } from '@/types';

/**
 * Automatically shows toast notifications from Inertia flash data
 * Uses a ref to track shown messages and prevent duplicates
 */
export const useFlashToast = () => {
  const { flash } = usePage<{ flash: FlashData }>().props;
  const shownMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!flash) return;

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
      // Create a unique key for this message
      const key = `${type}:${message}`;

      // Only show if we haven't shown this exact message yet
      if (!shownMessages.current.has(key)) {
        shownMessages.current.add(key);

        switch (type) {
          case 'success':
            toast.success(message);
            break;
          case 'error':
            toast.error(message);
            break;
          case 'info':
            toast.info(message);
            break;
          case 'warning':
            toast.warning(message);
            break;
        }

        // Clear the shown message after 100ms to allow same message to show again later
        setTimeout(() => {
          shownMessages.current.delete(key);
        }, 100);
      }
    };

    if (flash.success) {
      showToast(flash.success, 'success');
    }
    if (flash.error) {
      showToast(flash.error, 'error');
    }
    if (flash.notice) {
      showToast(flash.notice, 'info');
    }
    if (flash.alert) {
      showToast(flash.alert, 'warning');
    }
  }, [flash]);
};
