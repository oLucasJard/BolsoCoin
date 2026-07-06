'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDashboardStats } from '@/lib/sheets/transacoes';
import { getLimiteTotal, getLimiteUtilizadoTotal } from '@/lib/sheets/cartoes';
import { getTotalMensal } from '@/lib/sheets/recorrentes';
import { getTotalAplicado, getTotalAtual } from '@/lib/sheets/investimentos';
import { getTotalMeta, getTotalAtual as getTotalReservas } from '@/lib/sheets/reservas';
import TransactionList from '@/components/TransactionList';
import BalanceChart from '@/components/BalanceChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Wallet, TrendingUp, TrendingDown, Sparkles, ArrowRight, CreditCard, Repeat, TrendingUp as TrendInvest, PiggyBank } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [cartaoInfo, setCartaoInfo] = useState({ limiteTotal: 0, limiteUsado: 0 });
  const [recorrentesTotal, setRecorrentesTotal] = useState(0);
  const [investInfo, setInvestInfo] = useState({ aplicado: 0, atual: 0 });
  const [reservasInfo, setReservasInfo] = useState({ meta: 0, atual: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, lt, lu, rm, ia, iat, rmTotal, ra] = await Promise.all([
        getDashboardStats(),
        getLimiteTotal(),
        getLimiteUtilizadoTotal(),
        getTotalMensal(),
        getTotalAplicado(),
        getTotalAtual(),
        getTotalMeta(),
        getTotalReservas(),
      ]);
      setStats(s);
      setCartaoInfo({ limiteTotal: lt, limiteUsado: lu });
      setRecorrentesTotal(rm);
      setInvestInfo({ aplicado: ia, atual: iat });
      setReservasInfo({ meta: rmTotal, atual: ra });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading || !stats) {
    return <LoadingSpinner fullScreen message="Carregando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-c6-black text-white">
      <Link
        href="/magica"
        className="sm:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-c6-yellow rounded-full flex items-center justify-center shadow-c6-yellow active:scale-95 transition-transform touch-manipulation"
      >
        <Sparkles className="text-c6-black" size={24} />
      </Link>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Seu Resumo Financeiro
            </h1>
            <p className="text-c6-gray-400 text-sm sm:text-base">
              Tudo sincronizado com sua planilha
            </p>
          </div>
          <Link href="/magica" className="hidden sm:flex btn-c6 items-center space-x-2">
            <Sparkles size={20} />
            <span>Adicionar Rápido</span>
          </Link>
        </div>

        {/* Saldo Principal */}
        <div className="card-c6 bg-gradient-to-br from-c6-yellow to-c6-yellow-dark p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-c6-black/70 text-sm font-medium mb-2">Saldo Total</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-c6-black">
                R$ {stats.balance.toFixed(2)}
              </h2>
            </div>
            <div className="w-12 h-12 bg-c6-black/10 rounded-full flex items-center justify-center">
              <Wallet className="text-c6-black" size={24} />
            </div>
          </div>
        </div>

        {/* Cards de Resumo do Mês */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-c6 bg-c6-gray-900">
            <div className="w-10 h-10 bg-green-500/20 rounded-c6-sm flex items-center justify-center mb-2">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-c6-gray-400 text-sm mb-1">Receitas do Mês</p>
            <p className="font-display text-2xl font-bold text-green-500">R$ {stats.totalIncome.toFixed(2)}</p>
          </div>
          <div className="card-c6 bg-c6-gray-900">
            <div className="w-10 h-10 bg-red-500/20 rounded-c6-sm flex items-center justify-center mb-2">
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <p className="text-c6-gray-400 text-sm mb-1">Despesas do Mês</p>
            <p className="font-display text-2xl font-bold text-red-500">R$ {stats.totalExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* Cards Novas Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/cartoes" className="card-c6 bg-c6-gray-900 hover:border-c6-yellow/50 transition-all">
            <CreditCard className="text-c6-yellow mb-2" size={20} />
            <p className="text-c6-gray-400 text-xs">Cartões</p>
            <p className="font-display text-lg font-bold text-white">
              {cartaoInfo.limiteUsado > 0 ? `${((cartaoInfo.limiteUsado / (cartaoInfo.limiteTotal || 1)) * 100).toFixed(0)}%` : '0%'}
            </p>
            <p className="text-c6-gray-500 text-[10px]">R$ {cartaoInfo.limiteUsado.toFixed(0)} de R$ {cartaoInfo.limiteTotal.toFixed(0)}</p>
          </Link>
          <Link href="/recorrentes" className="card-c6 bg-c6-gray-900 hover:border-c6-yellow/50 transition-all">
            <Repeat className="text-c6-yellow mb-2" size={20} />
            <p className="text-c6-gray-400 text-xs">Recorrentes</p>
            <p className="font-display text-lg font-bold text-white">R$ {recorrentesTotal.toFixed(0)}</p>
            <p className="text-c6-gray-500 text-[10px]">Total mensal</p>
          </Link>
          <Link href="/investimentos" className="card-c6 bg-c6-gray-900 hover:border-c6-yellow/50 transition-all">
            <TrendInvest className="text-c6-yellow mb-2" size={20} />
            <p className="text-c6-gray-400 text-xs">Investimentos</p>
            <p className="font-display text-lg font-bold text-green-500">R$ {investInfo.atual.toFixed(0)}</p>
            <p className="text-c6-gray-500 text-[10px]">Aplicado: R$ {investInfo.aplicado.toFixed(0)}</p>
          </Link>
          <Link href="/reservas" className="card-c6 bg-c6-gray-900 hover:border-c6-yellow/50 transition-all">
            <PiggyBank className="text-c6-yellow mb-2" size={20} />
            <p className="text-c6-gray-400 text-xs">Reservas</p>
            <p className="font-display text-lg font-bold text-white">R$ {reservasInfo.atual.toFixed(0)}</p>
            <p className="text-c6-gray-500 text-[10px]">Meta: R$ {reservasInfo.meta.toFixed(0)}</p>
          </Link>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card-c6 bg-c6-gray-900">
            <h3 className="font-display text-lg font-semibold mb-4">Balanço Mensal</h3>
            <BalanceChart totalIncome={stats.totalIncome} totalExpense={stats.totalExpense} />
          </div>
          <div className="card-c6 bg-c6-gray-900">
            <h3 className="font-display text-lg font-semibold mb-4">Despesas por Categoria</h3>
            <CategoryPieChart categories={stats.topCategories} />
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="card-c6 bg-c6-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg sm:text-xl font-semibold">Últimas Transações</h3>
            <Link href="/transacoes" className="text-c6-yellow hover:text-c6-yellow-light font-medium text-sm flex items-center space-x-1 touch-manipulation">
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
