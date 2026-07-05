import { createContext, useContext, ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { Workspace } from '@/types';

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const page = usePage<{ currentWorkspace?: Workspace; workspaces?: Workspace[] }>();
  const workspace = page.props.currentWorkspace ?? null;
  const workspaces = page.props.workspaces ?? (workspace ? [workspace] : []);

  const value: WorkspaceContextType = {
    workspace,
    workspaces,
    switchWorkspace: (workspaceId: string) => {
      router.post(`/w/${workspaceId}/switch`, {}, { preserveScroll: true });
    },
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};
