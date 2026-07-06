'use client';

import { useEffect, useState, useCallback } from 'react';
import { listarOrcamentos, criarOrcamento, removerOrcamento, listarMetas, criarMeta, atualizarMeta, removerMeta, getBudgetComparison } from '@/lib/sheets/orcamentos';
import { toast } from 'sonner';
import { Plus, Target, Trash2 } from 'lucide-react';

export default function OrcamentosPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, g, c] = await Promise.all([
        listarOrcamentos(),
        listarMetas(),
        getBudgetComparison(currentMonth, currentYear),
      ]);
      setBudgets(b.filter((o: any) => Number(o.mes) === currentMonth && Number(o.ano) === currentYear));
      setGoals(g);
      setComparison(c);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateBudget = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await criarOrcamento({
        categoria: formData.get('category') as string,
        valor_limite: parseFloat(formData.get('amount') as string),
        mes: currentMonth,
        ano: currentYear,
      });
      toast.success('Orçamento criado!');
      setShowBudgetModal(false);
      loadData();
    } catch { toast.error('Erro ao criar orçamento'); }
  }, [currentMonth, currentYear, loadData]);

  const handleCreateGoal = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await criarMeta({
        titulo: formData.get('title') as string,
        descricao: (formData.get('description') as string) || '',
        valor_alvo: parseFloat(formData.get('amount') as string),
        valor_atual: 0,
        prazo: (formData.get('deadline') as string) || '',
        status: 'ativa',
      });
      toast.success('Meta criada!');
      setShowGoalModal(false);
      loadData();
    } catch { toast.error('Erro ao criar meta'); }
  }, [loadData]);

  const handleDeleteBudget = useCallback(async (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return;
    try {
      await removerOrcamento(id);
      toast.success('Orçamento excluído!');
      loadData();
    } catch { toast.error('Erro ao excluir orçamento'); }
  }, [loadData]);

  const handleDeleteGoal = useCallback(async (id: string) => {
    if (!confirm('Deseja excluir esta meta?')) return;
    try {
      await removerMeta(id);
      toast.success('Meta excluída!');
      loadData();
    } catch { toast.error('Erro ao excluir meta'); }
  }, [loadData]);

  const handleAddProgressoMeta = async (goal: any) => {
    const input = prompt('Quanto deseja adicionar ao progresso? (R$)');
    if (!input) return;
    const valor = parseFloat(input.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    const novoAtual = Number(goal.valor_atual) + valor;
    const status = novoAtual >= Number(goal.valor_alvo) ? 'completa' : 'ativa';
    try {
      await atualizarMeta(goal.id, { valor_atual: novoAtual, status });
      toast.success('Progresso atualizado!');
      loadData();
    } catch { toast.error('Erro ao atualizar meta'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Orçamentos e Metas</h1>
        <div className="flex space-x-4">
          <button onClick={() => setShowBudgetModal(true)} className="btn-c6 text-sm py-2 px-4">+ Novo Orçamento</button>
          <button onClick={() => setShowGoalModal(true)} className="btn-c6 text-sm py-2 px-4 bg-green-600 hover:bg-green-700 border-green-600">+ Nova Meta</button>
        </div>
      </div>

      {/* Budget Comparison */}
      <div className="card-c6 bg-c6-gray-900">
        <h2 className="font-display text-xl font-semibold text-white mb-4">Orçamento vs Realizado - {currentMonth}/{currentYear}</h2>
        <div className="space-y-4">
          {comparison.map((item) => (
            <div key={item.id || item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-c6-gray-400">R$ {item.spent.toFixed(2)} / R$ {item.budget.toFixed(2)}</span>
                  {item.id && (
                    <button onClick={() => handleDeleteBudget(item.id)} className="text-red-500 hover:text-red-400 p-1" title="Excluir orçamento">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-c6-gray-800 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    item.percentage > 100 ? 'bg-red-500' : item.percentage > 80 ? 'bg-c6-yellow' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className={item.percentage > 100 ? 'text-red-500' : item.percentage > 80 ? 'text-c6-yellow' : 'text-green-500'}>
                  {item.percentage.toFixed(0)}% usado
                </span>
                <span className="text-c6-gray-400">Restam: R$ {Math.max(item.remaining, 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {comparison.length === 0 && (
            <p className="text-center text-c6-gray-500 py-8">Nenhum orçamento definido para este mês</p>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="card-c6 bg-c6-gray-900">
        <h2 className="font-display text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="text-c6-yellow" size={24} />
          <span>Metas Financeiras</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const alvo = Number(goal.valor_alvo);
            const progress = alvo > 0 ? (Number(goal.valor_atual) / alvo) * 100 : 0;
            return (
              <div key={goal.id} className="border border-c6-gray-700 rounded-c6-sm p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{goal.titulo}</h3>
                    {goal.descricao && <p className="text-sm text-c6-gray-400">{goal.descricao}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleAddProgressoMeta(goal)} className="text-c6-yellow hover:text-c6-yellow-light text-xs px-2 py-1">
                      + R$
                    </button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-c6-gray-400">Progresso:</span>
                    <span className="font-medium text-white">R$ {Number(goal.valor_atual).toFixed(2)} / R$ {Number(goal.valor_alvo).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-c6-gray-800 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-c6-yellow'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-c6-gray-400">
                    {progress.toFixed(0)}% concluído
                    {goal.status === 'completa' && <span className="ml-2 text-green-500 font-semibold">Completo!</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="col-span-2 text-center text-c6-gray-500 py-8">Nenhuma meta definida</p>
          )}
        </div>
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Novo Orçamento</h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Categoria</label>
                <input type="text" name="category" required className="input-c6" placeholder="Ex: Alimentação" />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Limite</label>
                <input type="number" name="amount" required step="0.01" min="0" className="input-c6" placeholder="0.00" />
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm hover:bg-c6-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Nova Meta</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Título</label>
                <input type="text" name="title" required className="input-c6" placeholder="Ex: Reserva de Emergência" />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Descrição (opcional)</label>
                <textarea name="description" rows={2} className="input-c6" placeholder="Detalhes da meta..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Alvo</label>
                <input type="number" name="amount" required step="0.01" min="0" className="input-c6" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Prazo (opcional)</label>
                <input type="date" name="deadline" className="input-c6" />
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm hover:bg-c6-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6 bg-green-600 hover:bg-green-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
