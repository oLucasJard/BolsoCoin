'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getDashboardStats } from '@/lib/actions/transaction.actions';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import BalanceChart from '@/components/BalanceChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import { Wallet, TrendingUp, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceLoading && activeWorkspace) {
      loadStats();
    }
  }, [activeWorkspace, workspaceLoading]);

  const loadStats = async () => {
    if (!activeWorkspace) return;
    
    setLoading(true);
    try {
      const data = await getDashboardStats(activeWorkspace.id);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (workspaceLoading || loading || !stats) {
    return (
      <div className="min-h-screen bg-c6-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow mx-auto mb-4"></div>
          <p className="text-c6-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-c6-black text-white">
      {/* Quick Action Button - Mobile Floating */}
      <Link
        href="/magica"
        className="sm:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-c6-yellow rounded-full flex items-center justify-center shadow-c6-yellow active:scale-95 transition-transform touch-manipulation"
      >
        <Sparkles className="text-c6-black" size={24} />
      </Link>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Olá! 👋
            </h1>
            <p className="text-c6-gray-400 text-sm sm:text-base">
              Aqui está o resumo das suas finanças
            </p>
          </div>
          
          {/* Desktop Quick Action Button */}
          <Link
            href="/magica"
            className="hidden sm:flex btn-c6 items-center space-x-2"
          >
            <Sparkles size={20} />
            <span>Adicionar Rápido</span>
          </Link>
        </div>

        {/* Balance Card - Destaque */}
        <div className="card-c6 bg-gradient-to-br from-c6-yellow to-c6-yellow-dark p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-c6-black/70 text-sm font-medium mb-2">Saldo Atual</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-c6-black">
                R$ {stats.balance.toFixed(2)}
              </h2>
            </div>
            <div className="w-12 h-12 bg-c6-black/10 rounded-full flex items-center justify-center">
              <Wallet className="text-c6-black" size={24} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-c6 bg-c6-gray-900">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-c6-sm flex items-center justify-center">
                <TrendingUp className="text-green-500" size={20} />
              </div>
            </div>
            <p className="text-c6-gray-400 text-sm mb-1">Receitas do Mês</p>
            <p className="font-display text-2xl font-bold text-green-500">
              R$ {stats.totalIncome.toFixed(2)}
            </p>
          </div>

          <div className="card-c6 bg-c6-gray-900">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-c6-sm flex items-center justify-center">
                <TrendingDown className="text-red-500" size={20} />
              </div>
            </div>
            <p className="text-c6-gray-400 text-sm mb-1">Despesas do Mês</p>
            <p className="font-display text-2xl font-bold text-red-500">
              R$ {stats.totalExpense.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Balance Chart */}
          <div className="card-c6 bg-c6-gray-900">
            <h3 className="font-display text-lg font-semibold mb-4">
              Balanço Mensal
            </h3>
            <BalanceChart totalIncome={stats.totalIncome} totalExpense={stats.totalExpense} />
          </div>

          {/* Category Pie Chart */}
          <div className="card-c6 bg-c6-gray-900">
            <h3 className="font-display text-lg font-semibold mb-4">
              Despesas por Categoria
            </h3>
            <CategoryPieChart categories={stats.topCategories} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-c6 bg-c6-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg sm:text-xl font-semibold">
              Últimas Transações
            </h3>
            <Link
              href="/transacoes"
              className="text-c6-yellow hover:text-c6-yellow-light font-medium text-sm flex items-center space-x-1 touch-manipulation"
            >
              <span>Ver todas</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <TransactionList transactions={stats.recentTransactions} />
        </div>
      </div>
    </div>
  );
}
