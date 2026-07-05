import { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';

type KeyboardHandler = (e: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyboardHandler;
  description?: string;
}

interface KeyboardContextType {
  registerShortcut: (shortcut: KeyboardShortcut) => () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

const shortcuts: KeyboardShortcut[] = [];

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcuts.push(shortcut);
    return () => {
      const index = shortcuts.indexOf(shortcut);
      if (index > -1) {
        shortcuts.splice(index, 1);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow ⌘K even in inputs
        if (!(e.metaKey && e.key === 'k')) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === e.metaKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: KeyboardContextType = {
    registerShortcut,
    shortcuts,
  };

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider');
  }
  return context;
};

// Hook for registering shortcuts
export const useKeyboardShortcut = (shortcut: KeyboardShortcut) => {
  const { registerShortcut } = useKeyboard();

  useEffect(() => {
    return registerShortcut(shortcut);
  }, [registerShortcut, shortcut]);
};
