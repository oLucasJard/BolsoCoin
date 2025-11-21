'use client';

import { useEffect, useState } from 'react';
import {
  getBudgets,
  getGoals,
  createBudget,
  createGoal,
  updateGoalProgress,
  deleteBudget,
  deleteGoal,
  getBudgetComparison,
} from '@/lib/actions/budget.actions';
import { toast } from 'sonner';
import { Plus, Target, DollarSign, TrendingUp, Trash2, Edit } from 'lucide-react';

type Budget = {
  id: string;
  category_name: string;
  amount: number;
  month: number;
  year: number;
};

type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
};

type BudgetComparison = {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
};

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [comparison, setComparison] = useState<BudgetComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, goalsData, comparisonData] = await Promise.all([
        getBudgets(currentMonth, currentYear),
        getGoals(),
        getBudgetComparison(currentMonth, currentYear),
      ]);
      setBudgets(budgetsData);
      setGoals(goalsData);
      setComparison(comparisonData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createBudget({
        categoryName: formData.get('category') as string,
        amount: parseFloat(formData.get('amount') as string),
        month: currentMonth,
        year: currentYear,
      });
      toast.success('Orçamento criado!');
      setShowBudgetModal(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar orçamento');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createGoal({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        targetAmount: parseFloat(formData.get('amount') as string),
        deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string) : undefined,
      });
      toast.success('Meta criada!');
      setShowGoalModal(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar meta');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return;

    try {
      await deleteBudget(id);
      toast.success('Orçamento excluído!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir orçamento');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Deseja excluir esta meta?')) return;

    try {
      await deleteGoal(id);
      toast.success('Meta excluída!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir meta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Orçamentos e Metas
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo Orçamento</span>
          </button>
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Budget Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Orçamento vs Realizado - {currentMonth}/{currentYear}
        </h2>
        <div className="space-y-4">
          {comparison.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.category}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  R$ {item.spent.toFixed(2)} / R$ {item.budget.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    item.percentage > 100
                      ? 'bg-red-600'
                      : item.percentage > 80
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={
                    item.percentage > 100
                      ? 'text-red-600'
                      : item.percentage > 80
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }
                >
                  {item.percentage.toFixed(0)}% usado
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Restam: R$ {Math.max(item.remaining, 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {comparison.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhum orçamento definido para este mês
            </p>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Target size={24} className="text-green-600" />
          <span>Metas Financeiras</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            return (
              <div
                key={goal.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso:</span>
                    <span className="font-medium">
                      R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progress >= 100 ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {progress.toFixed(0)}% concluído
                    {goal.status === 'completed' && (
                      <span className="ml-2 text-green-600 font-semibold">✓ Completo!</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma meta definida
            </p>
          )}
        </div>
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Novo Orçamento
            </h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Ex: Alimentação"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Limite
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nova Meta</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Ex: Reserva de Emergência"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Detalhes da meta..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Alvo
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prazo (opcional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

