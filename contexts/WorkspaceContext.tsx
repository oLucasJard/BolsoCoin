'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

  // Carregar workspace ativo do localStorage (otimizado)
  useEffect(() => {
    if (workspaces.length === 0) {
      setIsLoading(false);
      return;
    }

    const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
    
    if (savedWorkspaceId) {
      const workspace = workspaces.find((w) => w.id === savedWorkspaceId);
      if (workspace) {
        setActiveWorkspaceState(workspace);
        setIsLoading(false);
        return;
      }
    }
    
    // Se não encontrou ou não tem salvo, usa o primeiro
    setActiveWorkspaceState(workspaces[0]);
    setIsLoading(false);
  }, [workspaces]);

  // Memoizar função setActiveWorkspace
  const setActiveWorkspace = useCallback((workspace: Workspace | null) => {
    setActiveWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem('activeWorkspaceId', workspace.id);
    } else {
      localStorage.removeItem('activeWorkspaceId');
    }
  }, []);

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo(
    () => ({
      activeWorkspace,
      setActiveWorkspace,
      workspaces,
      setWorkspaces,
      isLoading,
    }),
    [activeWorkspace, setActiveWorkspace, workspaces, isLoading]
  );

  return (
    <WorkspaceContext.Provider value={contextValue}>
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

