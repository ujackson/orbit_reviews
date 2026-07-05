import { ReactNode, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { WorkspaceRail } from './WorkspaceRail';
import { CommandPalette } from './CommandPalette';
import { GlobalToasts } from './GlobalToasts';
import { useUIStore } from '@/stores/uiStore';
import { useKeyboard } from '@/providers/KeyboardProvider';
import { useNavigate } from '@/hooks/useInertiaNavigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { workspace as workspaceRoutes } from '@/api';

interface OrbitShellProps {
  children: ReactNode;
}

export const OrbitShell = ({ children }: OrbitShellProps) => {
  const { openCommandPalette } = useUIStore();
  const { registerShortcut } = useKeyboard();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [gPressed, setGPressed] = useState(false);
  const gTimeoutRef = useRef<number | null>(null);
  const workspaceId = workspace?.id ?? 'default';

  useEffect(() => {
    return registerShortcut({
      key: 'k',
      meta: true,
      handler: () => openCommandPalette(),
      description: 'Open command palette',
    });
  }, [openCommandPalette, registerShortcut]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (event.key.toLowerCase() === 'g') {
        setGPressed(true);

        if (gTimeoutRef.current) {
          window.clearTimeout(gTimeoutRef.current);
        }

        gTimeoutRef.current = window.setTimeout(() => {
          setGPressed(false);
        }, 1000);
        return;
      }

      if (!gPressed) return;

      const destination = {
        i: workspaceRoutes.inbox.path({ workspace_id: workspaceId, view_id: 'all' }),
        c: workspaceRoutes.contacts.path({ workspace_id: workspaceId }),
        r: workspaceRoutes.rules.path({ workspace_id: workspaceId }),
        s: workspaceRoutes.settings.path({ workspace_id: workspaceId }),
      }[event.key.toLowerCase()];

      if (!destination) return;

      event.preventDefault();
      navigate(destination);
      setGPressed(false);

      if (gTimeoutRef.current) {
        window.clearTimeout(gTimeoutRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gTimeoutRef.current) {
        window.clearTimeout(gTimeoutRef.current);
      }
    };
  }, [gPressed, navigate, workspaceId]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <WorkspaceRail />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</Box>
      </Box>
      <CommandPalette />
      <GlobalToasts />
    </Box>
  );
};
