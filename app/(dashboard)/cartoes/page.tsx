'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar, criar, remover, atualizar } from '@/lib/sheets/cartoes';
import { listar as listarFaturas, criar as criarFatura, atualizar as atualizarFatura } from '@/lib/sheets/faturas';
import { criar as criarTransacao } from '@/lib/sheets/transacoes';
import { toast } from 'sonner';
import { CreditCard, Plus, Trash2, Receipt } from 'lucide-react';

const BANDEIRAS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Nubank', 'Outra'];
const CORES = ['#FFD100', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bandeira: 'Visa', nome: '', limite_total: '', cor: '#FFD100', data_fechamento: '5', data_vencimento: '15',
  });
  const [faturaForm, setFaturaForm] = useState({
    mes: String(new Date().getMonth() + 1),
    ano: String(new Date().getFullYear()),
    valor_total: '',
    data_vencimento: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([listar(), listarFaturas()]);
      setCartoes(c);
      setFaturas(f);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const limite = parseFloat(formData.limite_total);
    if (!formData.nome || !Number.isFinite(limite) || limite <= 0) {
      toast.error('Preencha nome e limite válidos');
      return;
    }
    try {
      await criar({
        bandeira: formData.bandeira,
        nome: formData.nome,
        limite_total: limite,
        limite_utilizado: 0,
        data_fechamento: parseInt(formData.data_fechamento),
        data_vencimento: parseInt(formData.data_vencimento),
        cor: formData.cor,
      });
      toast.success('Cartão adicionado!');
      setShowModal(false);
      setFormData({ bandeira: 'Visa', nome: '', limite_total: '', cor: '#FFD100', data_fechamento: '5', data_vencimento: '15' });
      loadData();
    } catch { toast.error('Erro ao criar cartão'); }
  };

  const handleCreateFatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCartao) return;
    const valor = parseFloat(faturaForm.valor_total);
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error('Valor da fatura inválido');
      return;
    }
    try {
      await criarFatura({
        cartao_id: selectedCartao,
        mes: parseInt(faturaForm.mes),
        ano: parseInt(faturaForm.ano),
        valor_total: valor,
        valor_pago: 0,
        status: 'aberta',
        data_vencimento: faturaForm.data_vencimento || `${faturaForm.ano}-${faturaForm.mes.padStart(2, '0')}-10`,
      });
      const cartao = cartoes.find((c) => c.id === selectedCartao);
      if (cartao) {
        await atualizar(selectedCartao, {
          limite_utilizado: Number(cartao.limite_utilizado) + valor,
        });
      }
      toast.success('Fatura criada!');
      setShowFaturaModal(false);
      setFaturaForm({ mes: String(new Date().getMonth() + 1), ano: String(new Date().getFullYear()), valor_total: '', data_vencimento: '' });
      loadData();
    } catch { toast.error('Erro ao criar fatura'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este cartão?')) return;
    try { await remover(id); toast.success('Cartão excluído!'); loadData(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const handlePagarFatura = async (fatura: any, cartao: any) => {
    if (!confirm(`Pagar fatura de R$ ${Number(fatura.valor_total).toFixed(2)}?`)) return;
    try {
      await atualizarFatura(fatura.id, { valor_pago: fatura.valor_total, status: 'paga' });
      const novoUtilizado = Math.max(0, Number(cartao.limite_utilizado) - Number(fatura.valor_total));
      await atualizar(cartao.id, { limite_utilizado: novoUtilizado });
      await criarTransacao({
        tipo: 'despesa',
        descricao: `Pagamento fatura ${cartao.nome} ${fatura.mes}/${fatura.ano}`,
        valor: Number(fatura.valor_total),
        categoria: 'Cartão de Crédito',
        fornecedor: cartao.nome,
        data: new Date().toISOString().split('T')[0],
        forma_pagamento: 'crédito',
        observacao: 'Pagamento de fatura',
        status: 'confirmada',
      });
      toast.success('Fatura paga!');
      loadData();
    } catch { toast.error('Erro ao pagar fatura'); }
  };

  const openFaturaModal = (cartaoId: string) => {
    setSelectedCartao(cartaoId);
    setShowFaturaModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Cartões de Crédito</h1>
        <button onClick={() => setShowModal(true)} className="btn-c6 text-sm py-2 px-4 flex items-center gap-2">
          <Plus size={18} /> Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cartoes.map((cartao) => {
          const usedPercent = cartao.limite_total > 0 ? (cartao.limite_utilizado / cartao.limite_total) * 100 : 0;
          const faturasCartao = faturas.filter((f: any) => f.cartao_id === cartao.id);
          return (
            <div key={cartao.id} className="card-c6 bg-c6-gray-900 overflow-hidden">
              <div className="h-2" style={{ background: cartao.cor }} />
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: cartao.cor + '30' }}>
                      <CreditCard size={20} style={{ color: cartao.cor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cartao.nome}</p>
                      <p className="text-xs text-c6-gray-400">{cartao.bandeira}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(cartao.id)} className="text-red-500 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-c6-gray-400">Limite</span>
                    <span className="text-white font-medium">R$ {Number(cartao.limite_utilizado).toFixed(0)} / R$ {Number(cartao.limite_total).toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-c6-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(usedPercent, 100)}%`, background: cartao.cor }} />
                  </div>
                  <div className="flex justify-between text-xs text-c6-gray-500">
                    <span>Fecha dia {cartao.data_fechamento}</span>
                    <span>Vence dia {cartao.data_vencimento}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-c6-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-c6-gray-400">Faturas</p>
                    <button onClick={() => openFaturaModal(cartao.id)} className="text-xs text-c6-yellow hover:text-c6-yellow-light flex items-center gap-1">
                      <Receipt size={14} /> Nova fatura
                    </button>
                  </div>
                  {faturasCartao.length > 0 ? faturasCartao.map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-c6-gray-300">{f.mes}/{f.ano}</span>
                      <span className={`text-sm font-medium ${
                        f.status === 'paga' ? 'text-green-500' : f.status === 'vencida' ? 'text-red-500' : 'text-c6-yellow'
                      }`}>
                        R$ {Number(f.valor_total).toFixed(2)}
                        {f.status === 'aberta' && (
                          <button onClick={() => handlePagarFatura(f, cartao)} className="ml-2 text-xs text-green-500 hover:text-green-400">
                            Pagar
                          </button>
                        )}
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-c6-gray-500">Nenhuma fatura</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {cartoes.length === 0 && (
          <div className="col-span-2 text-center py-16 text-c6-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-c6-gray-600" />
            <p className="text-lg mb-2">Nenhum cartão cadastrado</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Novo Cartão</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Bandeira</label>
                  <select value={formData.bandeira} onChange={(e) => setFormData({ ...formData, bandeira: e.target.value })} className="input-c6">
                    {BANDEIRAS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Cor</label>
                  <div className="flex gap-1 flex-wrap">
                    {CORES.map(c => (
                      <button key={c} type="button" onClick={() => setFormData({ ...formData, cor: c })}
                        className={`w-8 h-8 rounded-full border-2 ${formData.cor === c ? 'border-white' : 'border-transparent'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Nome</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="input-c6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Limite Total</label>
                <input type="number" value={formData.limite_total} onChange={(e) => setFormData({ ...formData, limite_total: e.target.value })} required step="0.01" min="0" className="input-c6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Dia Fechamento</label>
                  <input type="number" value={formData.data_fechamento} onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })} required min="1" max="31" className="input-c6" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Dia Vencimento</label>
                  <input type="number" value={formData.data_vencimento} onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })} required min="1" max="31" className="input-c6" />
                </div>
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFaturaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Nova Fatura</h2>
            <form onSubmit={handleCreateFatura} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Mês</label>
                  <input type="number" value={faturaForm.mes} onChange={(e) => setFaturaForm({ ...faturaForm, mes: e.target.value })} required min="1" max="12" className="input-c6" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Ano</label>
                  <input type="number" value={faturaForm.ano} onChange={(e) => setFaturaForm({ ...faturaForm, ano: e.target.value })} required className="input-c6" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Total</label>
                <input type="number" value={faturaForm.valor_total} onChange={(e) => setFaturaForm({ ...faturaForm, valor_total: e.target.value })} required step="0.01" min="0" className="input-c6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Data Vencimento</label>
                <input type="date" value={faturaForm.data_vencimento} onChange={(e) => setFaturaForm({ ...faturaForm, data_vencimento: e.target.value })} className="input-c6" />
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => setShowFaturaModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Criar Fatura</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
