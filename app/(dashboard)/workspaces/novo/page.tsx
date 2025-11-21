'use client';

import { createWorkspace, WorkspaceType } from '@/lib/actions/workspace.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const WORKSPACE_TYPES: { value: WorkspaceType; label: string; icon: string }[] = [
  { value: 'personal', label: 'Pessoal', icon: '👤' },
  { value: 'business', label: 'Empresa', icon: '💼' },
  { value: 'church', label: 'Igreja', icon: '⛪' },
  { value: 'project', label: 'Projeto', icon: '🚀' },
];

const WORKSPACE_COLORS = [
  '#FFD100', // C6 Yellow
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Light Yellow
  '#DFE6E9', // Light Gray
  '#A29BFE', // Purple
  '#FD79A8', // Pink
  '#FDCB6E', // Orange
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

export default function NewWorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'personal' as WorkspaceType,
    icon: '💼',
    color: '#FFD100',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome do workspace é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const workspace = await createWorkspace({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      });

      toast.success('Workspace criado com sucesso!');
      router.push('/workspaces');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar workspace');
    } finally {
      setLoading(false);
    }
  };

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
          Novo Workspace
        </h1>
        <p className="text-c6-gray-400">
          Crie um novo espaço de trabalho para organizar suas finanças
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
            disabled={loading}
            className="flex-1 py-3 bg-c6-yellow hover:bg-c6-yellow-hover text-c6-black font-bold rounded-c6-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? 'Criando...' : 'Criar Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}

