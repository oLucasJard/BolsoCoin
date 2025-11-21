'use client';

import {
  getWorkspace,
  updateWorkspace,
  WorkspaceType,
} from '@/lib/actions/workspace.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const WORKSPACE_TYPES: { value: WorkspaceType; label: string; icon: string }[] = [
  { value: 'personal', label: 'Pessoal', icon: '👤' },
  { value: 'business', label: 'Empresa', icon: '💼' },
  { value: 'church', label: 'Igreja', icon: '⛪' },
  { value: 'project', label: 'Projeto', icon: '🚀' },
];

const WORKSPACE_COLORS = [
  '#FFD100',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DFE6E9',
  '#A29BFE',
  '#FD79A8',
  '#FDCB6E',
];

const WORKSPACE_ICONS = [
  '💰',
  '💼',
  '🏢',
  '🏠',
  '⛪',
  '🚀',
  '🎯',
  '📊',
  '💎',
  '🌟',
  '🔥',
  '⚡',
];

export default function EditWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'personal' as WorkspaceType,
    icon: '💼',
    color: '#FFD100',
  });

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const workspace = await getWorkspace(workspaceId);
        if (workspace) {
          setFormData({
            name: workspace.name,
            description: workspace.description || '',
            type: workspace.type,
            icon: workspace.icon,
            color: workspace.color,
          });
        } else {
          toast.error('Workspace não encontrado');
          router.push('/workspaces');
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar workspace');
        router.push('/workspaces');
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [workspaceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome do workspace é obrigatório');
      return;
    }

    setSaving(true);

    try {
      await updateWorkspace(workspaceId, {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      });

      toast.success('Workspace atualizado com sucesso!');
      router.push('/workspaces');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar workspace');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center py-12">
          <div className="text-c6-gray-400">Carregando...</div>
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
          Editar Workspace
        </h1>
        <p className="text-c6-gray-400">
          Personalize as informações do seu workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        <div className="bg-c6-gray-900 rounded-c6-lg p-6 border border-c6-gray-800">
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto rounded-c6-lg flex items-center justify-center text-4xl mb-3"
              style={{ backgroundColor: formData.color + '20' }}
            >
              {formData.icon}
            </div>
            <h3 className="text-xl font-bold text-white">
              {formData.name || 'Nome do Workspace'}
            </h3>
            {formData.description && (
              <p className="text-sm text-c6-gray-400 mt-1">
                {formData.description}
              </p>
            )}
            <div className="mt-2">
              <span className="px-3 py-1 bg-c6-gray-800 text-c6-gray-300 text-xs font-medium rounded-full capitalize">
                {
                  WORKSPACE_TYPES.find((t) => t.value === formData.type)
                    ?.label
                }
              </span>
            </div>
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-c6-gray-300 mb-2">
            Nome do Workspace *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ex: Pessoal, Empresa, Igreja..."
            className="w-full px-4 py-3 bg-c6-gray-900 border border-c6-gray-700 rounded-c6-md text-white placeholder-c6-gray-500 focus:outline-none focus:border-c6-yellow transition-colors"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-c6-gray-300 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Breve descrição do workspace..."
            rows={3}
            className="w-full px-4 py-3 bg-c6-gray-900 border border-c6-gray-700 rounded-c6-md text-white placeholder-c6-gray-500 focus:outline-none focus:border-c6-yellow transition-colors resize-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-c6-gray-300 mb-3">
            Tipo de Workspace
          </label>
          <div className="grid grid-cols-2 gap-3">
            {WORKSPACE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: type.value })
                }
                className={`flex items-center gap-3 p-4 rounded-c6-md border-2 transition-all touch-manipulation ${
                  formData.type === type.value
                    ? 'border-c6-yellow bg-c6-yellow/10'
                    : 'border-c6-gray-700 bg-c6-gray-900 hover:border-c6-gray-600'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium text-white">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div>
          <label className="block text-sm font-medium text-c6-gray-300 mb-3">
            Ícone
          </label>
          <div className="grid grid-cols-6 gap-2">
            {WORKSPACE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`aspect-square rounded-c6-sm text-2xl flex items-center justify-center border-2 transition-all touch-manipulation ${
                  formData.icon === icon
                    ? 'border-c6-yellow bg-c6-yellow/10'
                    : 'border-c6-gray-700 bg-c6-gray-900 hover:border-c6-gray-600'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-c6-gray-300 mb-3">
            Cor
          </label>
          <div className="grid grid-cols-5 gap-3">
            {WORKSPACE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`aspect-square rounded-c6-sm border-2 transition-all touch-manipulation ${
                  formData.color === color
                    ? 'border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Link
            href="/workspaces"
            className="flex-1 py-3 bg-c6-gray-800 hover:bg-c6-gray-700 text-white font-medium rounded-c6-md text-center transition-all touch-manipulation"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-c6-yellow hover:bg-c6-yellow-hover text-c6-black font-bold rounded-c6-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

