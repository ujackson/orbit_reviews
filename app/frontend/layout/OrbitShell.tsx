import { ReactNode, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { WorkspaceRail } from './WorkspaceRail';
import { CommandPalette } from './CommandPalette';
import { GlobalToasts } from './GlobalToasts';
import { ScopeSelector } from './ScopeSelector';
import { useUIStore } from '../stores/uiStore';
import { useKeyboard } from '../providers/KeyboardProvider';

export const OrbitShell = ({ children }: { children: ReactNode }) => {
  const { openCommandPalette } = useUIStore();
  const { registerShortcut } = useKeyboard();
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();
  const [gPressed, setGPressed] = useState(false);
  const gRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ⌘K — command palette
  useEffect(() => {
    return registerShortcut({
      key: 'k', meta: true,
      handler: openCommandPalette,
      description: 'Open command palette',
    });
  }, [registerShortcut, openCommandPalette]);

  // Gmail-style keyboard nav: g+h, g+i, g+t, g+a, g+s
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;

      if (e.key === 'g' || e.key === 'G') {
        setGPressed(true);
        if (gRef.current) clearTimeout(gRef.current);
        gRef.current = setTimeout(() => setGPressed(false), 1000);
        return;
      }

      if (gPressed) {
        e.preventDefault();
        const map: Record<string, string> = {
          h: '', i: 'inbox', n: 'insights',
          t: 'themes', a: 'alerts', s: 'settings',
        };
        const dest = map[e.key.toLowerCase()];
        if (dest !== undefined) navigate(workspacePath(dest));
        setGPressed(false);
        if (gRef.current) clearTimeout(gRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (gRef.current) clearTimeout(gRef.current);
    };
  }, [gPressed, navigate]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <WorkspaceRail />

      {/* Main content area — scope strip + routed page */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ScopeSelector />
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>

      <CommandPalette />
      <GlobalToasts />
    </Box>
  );
};
