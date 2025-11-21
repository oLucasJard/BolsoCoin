'use client';

import { getWorkspaceMembers } from '@/lib/actions/workspace.actions';
import { ArrowLeft, Crown, Shield, User, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_manage_members: boolean;
  };
  joined_at: string;
};

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const ROLE_LABELS = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
};

const ROLE_COLORS = {
  owner: 'text-c6-yellow',
  admin: 'text-blue-400',
  member: 'text-green-400',
  viewer: 'text-c6-gray-400',
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getWorkspaceMembers(workspaceId);
        setMembers(data);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar membros');
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center py-12">
          <div className="text-c6-gray-400">Carregando membros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 text-c6-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Membros do Workspace
        </h1>
        <p className="text-c6-gray-400">
          {members.length} {members.length === 1 ? 'membro' : 'membros'}
        </p>
      </div>

      {/* Info sobre futura funcionalidade */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-c6-lg p-4 mb-6">
        <div className="text-blue-400 font-medium mb-1">
          🚀 Compartilhamento em breve!
        </div>
        <div className="text-sm text-c6-gray-300">
          Em breve você poderá convidar membros para colaborar neste workspace.
          Por enquanto, você pode ver quem tem acesso.
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="space-y-3">
        {members.map((member) => {
          const RoleIcon = ROLE_ICONS[member.role];
          const roleLabel = ROLE_LABELS[member.role];
          const roleColor = ROLE_COLORS[member.role];

          return (
            <div
              key={member.user_id}
              className="bg-c6-gray-900 rounded-c6-lg p-4 border border-c6-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-c6-gray-800 rounded-full flex items-center justify-center">
                    <User size={20} className="text-c6-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      ID: {member.user_id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-c6-gray-400">
                      Desde{' '}
                      {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${roleColor}`}>
                  <RoleIcon size={18} />
                  <span className="font-medium text-sm">{roleLabel}</span>
                </div>
              </div>

              {/* Permissões */}
              <div className="flex flex-wrap gap-2">
                {member.permissions.can_view && (
                  <span className="px-2 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs rounded-full">
                    Visualizar
                  </span>
                )}
                {member.permissions.can_create && (
                  <span className="px-2 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs rounded-full">
                    Criar
                  </span>
                )}
                {member.permissions.can_edit && (
                  <span className="px-2 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs rounded-full">
                    Editar
                  </span>
                )}
                {member.permissions.can_delete && (
                  <span className="px-2 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs rounded-full">
                    Deletar
                  </span>
                )}
                {member.permissions.can_manage_members && (
                  <span className="px-2 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs rounded-full">
                    Gerenciar Membros
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nenhum membro
            </h3>
            <p className="text-c6-gray-400">
              Ainda não há membros neste workspace
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

