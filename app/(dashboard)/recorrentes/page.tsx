'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar, criar, remover, atualizar, getTotalMensal } from '@/lib/sheets/recorrentes';
import { criar as criarTransacao } from '@/lib/sheets/transacoes';
import { dataVencimentoRecorrente } from '@/lib/sheets/utils';
import { toast } from 'sonner';
import { Repeat, Plus, Trash2, Play, Pause, Receipt } from 'lucide-react';

export default function RecorrentesPage() {
  const [recorrentes, setRecorrentes] = useState<any[]>([]);
  const [totalMensal, setTotalMensal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '', valor: '', categoria: 'Assinaturas', fornecedor: '',
    dia_vencimento: '5', tipo_recorrencia: 'mensal',
  });

  const CATEGORIAS = ['Assinaturas', 'Streaming', 'Seguros', 'Academia', 'Internet', 'Telefone', 'Aluguel', 'Financiamento', 'Outros'];

  const isAtivo = (rec: any) => rec.ativo === true || rec.ativo === 'true' || rec.ativo === 'sim';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, tm] = await Promise.all([listar(), getTotalMensal()]);
      setRecorrentes(r);
      setTotalMensal(tm);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        fornecedor: formData.fornecedor,
        dia_vencimento: parseInt(formData.dia_vencimento),
        tipo_recorrencia: formData.tipo_recorrencia,
        ativo: true,
        ultimo_pagamento: '',
      });
      toast.success('Cobrança recorrente criada!');
      setShowModal(false);
      setFormData({ descricao: '', valor: '', categoria: 'Assinaturas', fornecedor: '', dia_vencimento: '5', tipo_recorrencia: 'mensal' });
      loadData();
    } catch { toast.error('Erro ao criar'); }
  };

  const handleToggleAtivo = async (rec: any) => {
    try {
      await atualizar(rec.id, { ativo: !isAtivo(rec) });
      toast.success(isAtivo(rec) ? 'Cobrança pausada' : 'Cobrança ativada');
      loadData();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta cobrança recorrente?')) return;
    try { await remover(id); toast.success('Excluída!'); loadData(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const handleGerarTransacao = async (rec: any) => {
    if (!confirm(`Gerar transação de R$ ${Number(rec.valor).toFixed(2)} para "${rec.descricao}"?`)) return;
    try {
      const data = dataVencimentoRecorrente(Number(rec.dia_vencimento));
      await criarTransacao({
        tipo: 'despesa', descricao: rec.descricao, valor: Number(rec.valor),
        categoria: rec.categoria, fornecedor: rec.fornecedor, data,
        forma_pagamento: '', observacao: 'Gerado automático', status: 'confirmada',
      });
      await atualizar(rec.id, { ultimo_pagamento: data });
      toast.success('Transação gerada!');
      loadData();
    } catch { toast.error('Erro ao gerar transação'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Cobranças Recorrentes</h1>
        <button onClick={() => setShowModal(true)} className="btn-c6 text-sm py-2 px-4 flex items-center gap-2">
          <Plus size={18} /> Nova Cobrança
        </button>
      </div>

      <div className="card-c6 bg-gradient-to-br from-c6-yellow to-c6-yellow-dark p-6">
        <p className="text-c6-black/70 text-sm font-medium mb-1">Total Mensal em Recorrências</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-c6-black">R$ {totalMensal.toFixed(2)}</h2>
        <p className="text-c6-black/60 text-xs mt-1">{recorrentes.filter(isAtivo).length} cobranças ativas</p>
      </div>

      <div className="space-y-3">
        {recorrentes.map((rec) => {
          const ativo = isAtivo(rec);
          return (
            <div key={rec.id} className={`card-c6 bg-c6-gray-900 flex items-center justify-between p-4 ${!ativo ? 'opacity-50' : ''}`}>
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ativo ? 'bg-c6-yellow/20' : 'bg-c6-gray-800'}`}>
                  <Repeat size={20} className={ativo ? 'text-c6-yellow' : 'text-c6-gray-500'} />
                </div>
                <div>
                  <p className="font-semibold text-white">{rec.descricao}</p>
                  <p className="text-xs text-c6-gray-400">
                    {rec.fornecedor && `${rec.fornecedor} • `}{rec.categoria} • Dia {rec.dia_vencimento} • {rec.tipo_recorrencia}
                    {rec.ultimo_pagamento && ` • Último: ${rec.ultimo_pagamento}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <p className="font-bold text-lg text-red-500">R$ {Number(rec.valor).toFixed(2)}</p>
                <button onClick={() => handleToggleAtivo(rec)} className="p-2 text-c6-gray-400 hover:bg-c6-gray-800 rounded-full" title={ativo ? 'Pausar' : 'Ativar'}>
                  {ativo ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={() => handleGerarTransacao(rec)} className="p-2 text-green-500 hover:bg-c6-gray-800 rounded-full" title="Gerar transação">
                  <Receipt size={16} />
                </button>
                <button onClick={() => handleDelete(rec.id)} className="p-2 text-red-500 hover:bg-c6-gray-800 rounded-full">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {recorrentes.length === 0 && (
          <div className="text-center py-16 text-c6-gray-500">
            <Repeat size={48} className="mx-auto mb-4 text-c6-gray-600" />
            <p className="text-lg mb-2">Nenhuma cobrança recorrente</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Nova Cobrança Recorrente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Descrição</label>
                <input type="text" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} required className="input-c6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor</label>
                  <input type="number" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} required step="0.01" min="0" className="input-c6" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Dia Vencimento</label>
                  <input type="number" value={formData.dia_vencimento} onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })} required min="1" max="31" className="input-c6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Categoria</label>
                  <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="input-c6">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Recorrência</label>
                  <select value={formData.tipo_recorrencia} onChange={(e) => setFormData({ ...formData, tipo_recorrencia: e.target.value })} className="input-c6">
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Fornecedor</label>
                <input type="text" value={formData.fornecedor} onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })} className="input-c6" />
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
