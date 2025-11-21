import { getDashboardStats } from '@/lib/actions/transaction.actions';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
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
        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Top 5 Categorias
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  R$ {category.value.toFixed(2)}
                </span>
              </div>
            ))}
            {stats.topCategories.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma despesa registrada este mês
              </p>
            )}
          </div>
        </div>

        {/* Balance Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Balanço Mensal
          </h2>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Gráfico em desenvolvimento</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">Receitas:</span>
                  <span className="font-medium">R$ {stats.totalIncome.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-600">Despesas:</span>
                  <span className="font-medium">R$ {stats.totalExpense.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
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

