'use client';

import { useEffect, useState } from 'react';
import { getTransactions, deleteTransaction } from '@/lib/actions/transaction.actions';
import TransactionList from '@/components/TransactionList';
import { Database } from '@/lib/supabase/types';
import { toast } from 'sonner';
import { Filter } from 'lucide-react';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const filters = filter !== 'all' ? { type: filter as 'income' | 'expense' } : undefined;
      const data = await getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await deleteTransaction(id);
      toast.success('Transação excluída com sucesso');
      loadTransactions();
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Transações
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'expense'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      ) : (
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      )}
    </div>
  );
}

