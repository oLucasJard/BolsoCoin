import { getDashboardStats } from '@/lib/actions/transaction.actions';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import BalanceChart from '@/components/BalanceChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import { Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <Link
          href="/magica"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
        >
          <span>✨</span>
          <span>Adicionar Rápido</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Saldo Atual"
          value={`R$ ${stats.balance.toFixed(2)}`}
          icon={Wallet}
          color={stats.balance >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Receitas do Mês"
          value={`R$ ${stats.totalIncome.toFixed(2)}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Despesas do Mês"
          value={`R$ ${stats.totalExpense.toFixed(2)}`}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Balanço Mensal
          </h2>
          <BalanceChart totalIncome={stats.totalIncome} totalExpense={stats.totalExpense} />
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Despesas por Categoria
            </h2>
          </div>
          <CategoryPieChart categories={stats.topCategories} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Últimas Transações
          </h2>
          <Link
            href="/transacoes"
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
          >
            Ver todas →
          </Link>
        </div>
        <TransactionList transactions={stats.recentTransactions} />
      </div>
    </div>
  );
}

