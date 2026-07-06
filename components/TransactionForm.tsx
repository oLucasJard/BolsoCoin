'use client';

import { useState } from 'react';
import { criar } from '@/lib/sheets/transacoes';
import { toast } from 'sonner';
import { X, DollarSign, FileText, Calendar, Tag, Building2 } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TransactionForm({ onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'despesa' as 'receita' | 'despesa',
    valor: '',
    descricao: '',
    categoria: '',
    fornecedor: '',
    data: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || parseFloat(formData.valor) <= 0) { toast.error('Valor inválido'); return; }
    if (!formData.descricao) { toast.error('Descrição é obrigatória'); return; }

    setLoading(true);
    try {
      await criar({
        tipo: formData.tipo,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria || 'Outros',
        fornecedor: formData.fornecedor,
        data: formData.data,
        forma_pagamento: '',
        observacao: '',
        status: 'confirmada',
      });
      toast.success('Transação criada!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-c6-gray-900 border-b border-c6-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white">Nova Transação</h2>
          <button onClick={onClose} className="text-c6-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, tipo: 'despesa' })}
                className={`py-3 px-4 rounded-c6-sm font-medium transition-all ${formData.tipo === 'despesa' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-c6-gray-800 text-c6-gray-400 hover:bg-c6-gray-700'}`}>
                Despesa
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, tipo: 'receita' })}
                className={`py-3 px-4 rounded-c6-sm font-medium transition-all ${formData.tipo === 'receita' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-c6-gray-800 text-c6-gray-400 hover:bg-c6-gray-700'}`}>
                Receita
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2"><DollarSign size={16} className="inline mr-1" />Valor (R$)</label>
            <input type="number" step="0.01" min="0" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="input-c6" placeholder="0.00" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2"><FileText size={16} className="inline mr-1" />Descrição</label>
            <input type="text" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="input-c6" placeholder="Ex: Almoço no restaurante" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2"><Tag size={16} className="inline mr-1" />Categoria</label>
            <input type="text" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="input-c6" placeholder="Ex: Alimentação" />
          </div>
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2"><Building2 size={16} className="inline mr-1" />Fornecedor</label>
            <input type="text" value={formData.fornecedor} onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
              className="input-c6" placeholder="Ex: Restaurante XYZ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-c6-gray-300 mb-2"><Calendar size={16} className="inline mr-1" />Data</label>
            <input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="input-c6" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-c6-gray-800 text-white rounded-c6-sm hover:bg-c6-gray-700 transition-colors font-medium" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-c6-yellow text-c6-black rounded-c6-sm hover:bg-c6-yellow-light transition-colors font-medium disabled:opacity-50" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
