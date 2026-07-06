'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar, criar, remover, getTotalAplicado, getTotalAtual, atualizar } from '@/lib/sheets/investimentos';
import { toast } from 'sonner';
import { TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function InvestimentosPage() {
  const [investimentos, setInvestimentos] = useState<any[]>([]);
  const [totalAplicado, setTotalAplicado] = useState(0);
  const [totalAtual, setTotalAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', tipo: 'Ações', valor_aplicado: '', valor_atual: '', instituicao: '', rentabilidade: '',
  });

  const TIPOS = ['Ações', 'FIIs', 'Tesouro Direto', 'CDB', 'LCI/LCA', 'Fundos', 'Criptomoedas', 'Previdência', 'Outros'];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [i, ta, tat] = await Promise.all([listar(), getTotalAplicado(), getTotalAtual()]);
      setInvestimentos(i);
      setTotalAplicado(ta);
      setTotalAtual(tat);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        nome: formData.nome,
        tipo: formData.tipo,
        valor_aplicado: parseFloat(formData.valor_aplicado),
        valor_atual: parseFloat(formData.valor_atual || formData.valor_aplicado),
        data_aplicacao: new Date().toISOString().split('T')[0],
        instituicao: formData.instituicao,
        rentabilidade: formData.rentabilidade,
      });
      toast.success('Investimento adicionado!');
      setShowModal(false);
      setFormData({ nome: '', tipo: 'Ações', valor_aplicado: '', valor_atual: '', instituicao: '', rentabilidade: '' });
      loadData();
    } catch { toast.error('Erro ao criar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este investimento?')) return;
    try { await remover(id); toast.success('Excluído!'); loadData(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const handleAtualizarValor = async (inv: any) => {
    const input = prompt('Novo valor atual (R$):', String(inv.valor_atual));
    if (!input) return;
    const valor = parseFloat(input.replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) {
      toast.error('Valor inválido');
      return;
    }
    try {
      await atualizar(inv.id, { valor_atual: valor });
      toast.success('Valor atualizado!');
      loadData();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const lucroTotal = totalAtual - totalAplicado;
  const percentualTotal = totalAplicado > 0 ? (lucroTotal / totalAplicado) * 100 : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Investimentos</h1>
        <button onClick={() => setShowModal(true)} className="btn-c6 text-sm py-2 px-4 flex items-center gap-2">
          <Plus size={18} /> Novo Investimento
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-c6 bg-c6-gray-900">
          <p className="text-c6-gray-400 text-sm mb-1">Total Aplicado</p>
          <p className="font-display text-2xl font-bold text-white">R$ {totalAplicado.toFixed(2)}</p>
        </div>
        <div className="card-c6 bg-c6-gray-900">
          <p className="text-c6-gray-400 text-sm mb-1">Valor Atual</p>
          <p className="font-display text-2xl font-bold text-white">R$ {totalAtual.toFixed(2)}</p>
        </div>
        <div className={`card-c6 ${lucroTotal >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <p className="text-c6-gray-400 text-sm mb-1">Lucro/Prejuízo</p>
          <p className={`font-display text-2xl font-bold ${lucroTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {lucroTotal >= 0 ? '+' : ''}R$ {lucroTotal.toFixed(2)}
            <span className="text-sm ml-1">({percentualTotal >= 0 ? '+' : ''}{percentualTotal.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {investimentos.map((inv) => {
          const lucro = Number(inv.valor_atual) - Number(inv.valor_aplicado);
          const perc = Number(inv.valor_aplicado) > 0 ? (lucro / Number(inv.valor_aplicado)) * 100 : 0;
          return (
            <div key={inv.id} className="card-c6 bg-c6-gray-900 flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lucro >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {lucro >= 0 ? (
                    <ArrowUpRight size={20} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={20} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{inv.nome}</p>
                  <p className="text-xs text-c6-gray-400">{inv.tipo} {inv.instituicao && `• ${inv.instituicao}`}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-bold text-white">R$ {Number(inv.valor_atual).toFixed(2)}</p>
                  <p className={`text-xs ${lucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {lucro >= 0 ? '+' : ''}{perc.toFixed(1)}%
                  </p>
                </div>
                <button onClick={() => handleAtualizarValor(inv)} className="p-2 text-c6-yellow hover:bg-c6-gray-800 rounded-full transition text-xs">
                  Atualizar
                </button>
                <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-500 hover:bg-c6-gray-800 rounded-full transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {investimentos.length === 0 && (
          <div className="text-center py-16 text-c6-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 text-c6-gray-600" />
            <p className="text-lg mb-2">Nenhum investimento cadastrado</p>
            <p className="text-sm">Acompanhe suas ações, FIIs, CDBs e muito mais</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Novo Investimento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Nome</label>
                  <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="input-c6" placeholder="Ex: PETR4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Tipo</label>
                  <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="input-c6">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Aplicado</label>
                  <input type="number" value={formData.valor_aplicado} onChange={(e) => setFormData({ ...formData, valor_aplicado: e.target.value })} required step="0.01" min="0" className="input-c6" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Atual</label>
                  <input type="number" value={formData.valor_atual} onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })} step="0.01" min="0" className="input-c6" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Instituição</label>
                  <input type="text" value={formData.instituicao} onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })} className="input-c6" placeholder="Ex: XP Investimentos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Rentabilidade</label>
                  <input type="text" value={formData.rentabilidade} onChange={(e) => setFormData({ ...formData, rentabilidade: e.target.value })} className="input-c6" placeholder="Ex: 110% CDI" />
                </div>
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm hover:bg-c6-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
