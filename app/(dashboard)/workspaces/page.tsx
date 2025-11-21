'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getWorkspaceStats, deleteWorkspace } from '@/lib/actions/workspace.actions';
import { Settings, Trash2, Users, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

type WorkspaceStats = {
  transactions: number;
  budgets: number;
  goals: number;
  members: number;
};

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, WorkspaceStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});

  // Carregar stats de cada workspace
  useEffect(() => {
    workspaces.forEach(async (workspace) => {
      if (!stats[workspace.id] && !loadingStats[workspace.id]) {
        setLoadingStats((prev) => ({ ...prev, [workspace.id]: true }));
        try {
          const workspaceStats = await getWorkspaceStats(workspace.id);
          setStats((prev) => ({ ...prev, [workspace.id]: workspaceStats }));
        } catch (error) {
          console.error('Erro ao carregar stats:', error);
        } finally {
          setLoadingStats((prev) => ({ ...prev, [workspace.id]: false }));
        }
      }
    });
  }, [workspaces]);

  const handleDelete = async (workspaceId: string, workspaceName: string) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o workspace "${workspaceName}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      await deleteWorkspace(workspaceId);
      toast.success('Workspace deletado com sucesso!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar workspace');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Meus Workspaces
        </h1>
        <p className="text-c6-gray-400">
          Gerencie seus espaços de trabalho e organize suas finanças
        </p>
      </div>

      {/* Botão Criar Novo */}
      <Link
        href="/workspaces/novo"
        className="flex items-center justify-center gap-2 w-full py-4 bg-c6-yellow text-c6-black font-bold rounded-c6-md hover:bg-c6-yellow-hover active:scale-[0.98] transition-all mb-6 touch-manipulation"
      >
        <Plus size={20} />
        Criar Novo Workspace
      </Link>

      {/* Lista de Workspaces */}
      <div className="space-y-4">
        {workspaces.map((workspace) => {
          const isActive = activeWorkspace?.id === workspace.id;
          const workspaceStats = stats[workspace.id];
          const isLoadingStats = loadingStats[workspace.id];

          return (
            <div
              key={workspace.id}
              className={`bg-c6-gray-900 rounded-c6-lg p-4 border-2 transition-all ${
                isActive
                  ? 'border-c6-yellow'
                  : 'border-transparent hover:border-c6-gray-700'
              }`}
            >
              {/* Header do Workspace */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-c6-md flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: workspace.color + '20' }}
                >
                  {workspace.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">
                      {workspace.name}
                    </h3>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-c6-yellow text-c6-black text-xs font-bold rounded-full">
                        ATIVO
                      </span>
                    )}
                  </div>
                  {workspace.description && (
                    <p className="text-sm text-c6-gray-400 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-c6-gray-800 text-c6-gray-300 text-xs font-medium rounded-full capitalize">
                      {workspace.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {isLoadingStats ? (
                <div className="text-c6-gray-500 text-sm mb-4">
                  Carregando estatísticas...
                </div>
              ) : workspaceStats ? (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-c6-yellow font-bold">
                      {workspaceStats.transactions}
                    </div>
                    <div className="text-xs text-c6-gray-400">Transações</div>
                  </div>
                  <div className="text-center">
                    <div className="text-c6-yellow font-bold">
                      {workspaceStats.budgets}
                    </div>
                    <div className="text-xs text-c6-gray-400">Orçamentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-c6-yellow font-bold">
                      {workspaceStats.goals}
                    </div>
                    <div className="text-xs text-c6-gray-400">Metas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-c6-yellow font-bold">
                      {workspaceStats.members}
                    </div>
                    <div className="text-xs text-c6-gray-400">Membros</div>
                  </div>
                </div>
              ) : null}

              {/* Ações */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspaces/${workspace.id}/editar`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-c6-gray-800 hover:bg-c6-gray-700 text-white font-medium rounded-c6-sm transition-all touch-manipulation"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Editar</span>
                </Link>

                <Link
                  href={`/workspaces/${workspace.id}/membros`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-c6-gray-800 hover:bg-c6-gray-700 text-white font-medium rounded-c6-sm transition-all touch-manipulation"
                >
                  <Users size={16} />
                  <span className="hidden sm:inline">Membros</span>
                </Link>

                <button
                  onClick={() => handleDelete(workspace.id, workspace.name)}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-c6-sm transition-all touch-manipulation"
                  title="Deletar workspace"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum workspace ainda
            </h3>
            <p className="text-c6-gray-400 mb-6">
              Crie seu primeiro workspace para começar
            </p>
            <Link
              href="/workspaces/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-c6-yellow text-c6-black font-bold rounded-c6-md hover:bg-c6-yellow-hover transition-all"
            >
              <Plus size={20} />
              Criar Workspace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

