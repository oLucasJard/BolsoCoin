'use client';

import { useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Workspace } from '@/lib/actions/workspace.actions';

export default function WorkspaceLoader({
  initialWorkspaces,
}: {
  initialWorkspaces: Workspace[];
}) {
  const { setWorkspaces } = useWorkspace();

  useEffect(() => {
    setWorkspaces(initialWorkspaces);
  }, [initialWorkspaces, setWorkspaces]);

  return null;
}

