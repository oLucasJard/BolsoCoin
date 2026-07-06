'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar, remover } from '@/lib/sheets/transacoes';
import TransactionList from '@/components/TransactionList';
import { toast } from 'sonner';
import { Filter } from 'lucide-react';

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'receita' | 'despesa'>('all');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let data = await listar();
      if (filter !== 'all') {
        data = data.filter(t => t.tipo === filter);
      }
      data.sort((a, b) => b.data.localeCompare(a.data));
      setTransactions(data);
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await remover(id);
      toast.success('Transação excluída com sucesso');
      loadTransactions();
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  }, [loadTransactions]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Transações</h1>
      </div>

      {/* Filters */}
      <div className="card-c6 bg-c6-gray-900 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-c6-gray-400" />
          <div className="flex space-x-2">
            {(['all', 'receita', 'despesa'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  filter === f
                    ? 'bg-c6-yellow text-c6-black font-bold'
                    : 'bg-c6-gray-800 text-c6-gray-300 hover:bg-c6-gray-700'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'receita' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow mx-auto"></div>
          <p className="mt-4 text-c6-gray-400">Carregando...</p>
        </div>
      ) : (
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      )}
    </div>
  );
}
