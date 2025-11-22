'use client';

import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createTransaction } from '@/lib/actions/transaction.actions';
import { toast } from 'sonner';
import { X, DollarSign, FileText, Calendar, Tag, Building2 } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TransactionForm({ onClose, onSuccess }: TransactionFormProps) {
  const { activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    categoryName: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWorkspace) {
      toast.error('Nenhum workspace ativo');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!formData.description) {
      toast.error('Descrição é obrigatória');
      return;
    }

    setLoading(true);

    try {
      await createTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        categoryName: formData.categoryName || undefined,
        vendor: formData.vendor || undefined,
        date: new Date(formData.date),
        source: 'manual',
        workspaceId: activeWorkspace.id,
      });

      toast.success('Transação criada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      toast.error(error.message || 'Erro ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-c6-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-c6-gray-900 border-b border-c6-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white">
            Nova Transação Manual
          </h2>
          <button
            onClick={onClose}
            className="text-c6-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              Tipo *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-c6-gray-800 text-c6-gray-400 hover:bg-c6-gray-700'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'bg-c6-gray-800 text-c6-gray-400 hover:bg-c6-gray-700'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-c6-gray-800 text-white rounded-lg border border-c6-gray-700 focus:border-c6-yellow focus:ring-1 focus:ring-c6-yellow transition-colors"
              placeholder="0.00"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              <FileText size={16} className="inline mr-1" />
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-c6-gray-800 text-white rounded-lg border border-c6-gray-700 focus:border-c6-yellow focus:ring-1 focus:ring-c6-yellow transition-colors"
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              <Tag size={16} className="inline mr-1" />
              Categoria (opcional)
            </label>
            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="w-full px-4 py-3 bg-c6-gray-800 text-white rounded-lg border border-c6-gray-700 focus:border-c6-yellow focus:ring-1 focus:ring-c6-yellow transition-colors"
              placeholder="Ex: Alimentação"
            />
          </div>

          {/* Estabelecimento */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              <Building2 size={16} className="inline mr-1" />
              Estabelecimento (opcional)
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-4 py-3 bg-c6-gray-800 text-white rounded-lg border border-c6-gray-700 focus:border-c6-yellow focus:ring-1 focus:ring-c6-yellow transition-colors"
              placeholder="Ex: Restaurante XYZ"
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-c6-gray-800 text-white rounded-lg border border-c6-gray-700 focus:border-c6-yellow focus:ring-1 focus:ring-c6-yellow transition-colors"
              required
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-c6-gray-800 text-white rounded-lg hover:bg-c6-gray-700 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-c6-yellow text-c6-black rounded-lg hover:bg-c6-yellow-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

