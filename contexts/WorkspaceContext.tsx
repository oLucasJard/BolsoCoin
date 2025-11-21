'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace } from '@/lib/actions/workspace.actions';

type WorkspaceContextType = {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  isLoading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar workspace ativo do localStorage
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
    if (savedWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === savedWorkspaceId);
      if (workspace) {
        setActiveWorkspaceState(workspace);
      } else {
        // Se não encontrou, usa o primeiro
        setActiveWorkspaceState(workspaces[0]);
      }
    } else if (workspaces.length > 0) {
      // Se não tem salvo, usa o primeiro
      setActiveWorkspaceState(workspaces[0]);
    }
    setIsLoading(false);
  }, [workspaces]);

  const setActiveWorkspace = (workspace: Workspace | null) => {
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('activeWorkspaceId', workspace.id);
    } else {
      localStorage.removeItem('activeWorkspaceId');
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
        workspaces,
        setWorkspaces,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

