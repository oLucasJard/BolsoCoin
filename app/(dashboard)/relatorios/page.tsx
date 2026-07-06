'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar } from '@/lib/sheets/transacoes';
import { isDateInMonth, parseSheetNumber } from '@/lib/sheets/utils';
import CategoryPieChart from '@/components/CategoryPieChart';
import { BarChart3, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function RelatoriosPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    categorias: [] as { name: string; value: number }[],
    totalTx: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const transacoes = await listar();
      const monthTxs = transacoes.filter((t) => isDateInMonth(t.data, mes, ano));
      const receitas = monthTxs
        .filter((t) => t.tipo === 'receita')
        .reduce((s, t) => s + parseSheetNumber(t.valor), 0);
      const despesas = monthTxs
        .filter((t) => t.tipo === 'despesa')
        .reduce((s, t) => s + parseSheetNumber(t.valor), 0);

      const categoryStats: Record<string, number> = {};
      monthTxs.filter((t) => t.tipo === 'despesa').forEach((t) => {
        const cat = t.categoria || 'Outros';
        categoryStats[cat] = (categoryStats[cat] || 0) + parseSheetNumber(t.valor);
      });
      const categorias = Object.entries(categoryStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setStats({
        receitas,
        despesas,
        saldo: receitas - despesas,
        categorias,
        totalTx: monthTxs.length,
      });
    } catch {
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  useEffect(() => { loadData(); }, [loadData]);

  const anos = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-c6-yellow" size={28} />
          Relatórios
        </h1>
        <div className="flex gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="input-c6 text-sm py-2"
          >
            {MESES.map((nome, i) => (
              <option key={nome} value={i + 1}>{nome}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="input-c6 text-sm py-2"
          >
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-c6 bg-c6-gray-900 p-5">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <TrendingUp size={18} />
                <span className="text-sm text-c6-gray-400">Receitas</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">R$ {stats.receitas.toFixed(2)}</p>
            </div>
            <div className="card-c6 bg-c6-gray-900 p-5">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <TrendingDown size={18} />
                <span className="text-sm text-c6-gray-400">Despesas</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">R$ {stats.despesas.toFixed(2)}</p>
            </div>
            <div className="card-c6 bg-gradient-to-br from-c6-yellow to-c6-yellow-dark p-5">
              <div className="flex items-center gap-2 text-c6-black/70 mb-2">
                <Wallet size={18} />
                <span className="text-sm">Saldo do Mês</span>
              </div>
              <p className="font-display text-2xl font-bold text-c6-black">R$ {stats.saldo.toFixed(2)}</p>
              <p className="text-xs text-c6-black/60 mt-1">{stats.totalTx} transações</p>
            </div>
          </div>

          <div className="card-c6 bg-c6-gray-900 p-6">
            <h2 className="font-display text-lg font-bold text-white mb-4">Despesas por Categoria</h2>
            {stats.categorias.length > 0 ? (
              <>
                <CategoryPieChart categories={stats.categorias} />
                <div className="mt-4 space-y-2">
                  {stats.categorias.map((cat) => {
                    const pct = stats.despesas > 0 ? (cat.value / stats.despesas) * 100 : 0;
                    return (
                      <div key={cat.name} className="flex justify-between text-sm">
                        <span className="text-c6-gray-300">{cat.name}</span>
                        <span className="text-white font-medium">
                          R$ {cat.value.toFixed(2)} <span className="text-c6-gray-500">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-c6-gray-500 py-12">Nenhuma despesa neste período</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
