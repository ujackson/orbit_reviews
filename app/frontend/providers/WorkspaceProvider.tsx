import { createContext, useContext, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import type { Workspace } from '@/types';

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const page = usePage<{ currentWorkspace?: Workspace }>();
  const workspace = page.props.currentWorkspace ?? null;
  const workspaces = workspace ? [workspace] : [];

  const value: WorkspaceContextType = {
    workspace,
    workspaces,
    switchWorkspace: () => undefined,
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
