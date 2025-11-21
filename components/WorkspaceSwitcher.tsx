'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="relative">
      {/* Botão do Workspace Ativo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 bg-c6-gray-900 hover:bg-c6-gray-800 rounded-xl transition-all group"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: activeWorkspace.color + '20' }}
        >
          {activeWorkspace.icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-white truncate">
            {activeWorkspace.name}
          </div>
          <div className="text-xs text-c6-gray-400 capitalize">
            {activeWorkspace.type}
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-c6-gray-400 group-hover:text-white flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-c6-gray-900 rounded-xl shadow-2xl border border-c6-gray-800 z-50 overflow-hidden">
            {/* Lista de Workspaces */}
            <div className="max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-c6-gray-800 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: workspace.color + '20' }}
                  >
                    {workspace.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {workspace.name}
                    </div>
                    <div className="text-xs text-c6-gray-400 capitalize">
                      {workspace.type}
                    </div>
                  </div>
                  {workspace.id === activeWorkspace.id && (
                    <Check className="w-4 h-4 text-c6-yellow flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Ações */}
            <div className="border-t border-c6-gray-800">
              <Link
                href="/workspaces/novo"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-c6-gray-800 transition-colors text-white"
              >
                <Plus className="w-5 h-5 text-c6-yellow" />
                <span className="font-medium">Novo Workspace</span>
              </Link>
              <Link
                href="/workspaces"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-c6-gray-800 transition-colors text-white"
              >
                <Settings className="w-5 h-5 text-c6-gray-400" />
                <span>Gerenciar Workspaces</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

