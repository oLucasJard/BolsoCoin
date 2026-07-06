'use client';

import { useEffect, useState, useCallback } from 'react';
import { listar, criar, remover, getTotalMeta, getTotalAtual, atualizar } from '@/lib/sheets/reservas';
import { toast } from 'sonner';
import { PiggyBank, Plus, Trash2 } from 'lucide-react';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [totalMeta, setTotalMeta] = useState(0);
  const [totalAtual, setTotalAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', valor_meta: '', valor_atual: '', prioridade: 'media',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, tm, ta] = await Promise.all([listar(), getTotalMeta(), getTotalAtual()]);
      setReservas(r);
      setTotalMeta(tm);
      setTotalAtual(ta);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criar({
        nome: formData.nome,
        valor_meta: parseFloat(formData.valor_meta),
        valor_atual: parseFloat(formData.valor_atual || '0'),
        data_criacao: new Date().toISOString().split('T')[0],
        prioridade: formData.prioridade as any,
      });
      toast.success('Reserva criada!');
      setShowModal(false);
      setFormData({ nome: '', valor_meta: '', valor_atual: '', prioridade: 'media' });
      loadData();
    } catch { toast.error('Erro ao criar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta reserva?')) return;
    try { await remover(id); toast.success('Excluída!'); loadData(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const handleDepositar = async (res: any) => {
    const input = prompt('Quanto deseja depositar? (R$)');
    if (!input) return;
    const valor = parseFloat(input.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    try {
      await atualizar(res.id, { valor_atual: Number(res.valor_atual) + valor });
      toast.success('Depósito registrado!');
      loadData();
    } catch { toast.error('Erro ao depositar'); }
  };

  const progressoGeral = totalMeta > 0 ? (totalAtual / totalMeta) * 100 : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c6-yellow"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Reservas</h1>
        <button onClick={() => setShowModal(true)} className="btn-c6 text-sm py-2 px-4 flex items-center gap-2">
          <Plus size={18} /> Nova Reserva
        </button>
      </div>

      {/* Progresso Geral */}
      <div className="card-c6 bg-gradient-to-br from-c6-yellow to-c6-yellow-dark p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-c6-black/70 text-sm font-medium mb-1">Total Reservado</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-c6-black">R$ {totalAtual.toFixed(2)}</h2>
          </div>
          <PiggyBank className="text-c6-black/40" size={32} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-c6-black/70">
            <span>Progresso geral</span>
            <span className="font-bold">R$ {totalAtual.toFixed(0)} / R$ {totalMeta.toFixed(0)}</span>
          </div>
          <div className="w-full bg-c6-black/20 rounded-full h-3">
            <div className="h-3 rounded-full bg-c6-black/60 transition-all" style={{ width: `${Math.min(progressoGeral, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reservas.map((res) => {
          const progress = Number(res.valor_meta) > 0 ? (Number(res.valor_atual) / Number(res.valor_meta)) * 100 : 0;
          const prioColor = res.prioridade === 'alta' ? 'text-red-500' : res.prioridade === 'media' ? 'text-c6-yellow' : 'text-green-500';
          return (
            <div key={res.id} className="card-c6 bg-c6-gray-900">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{res.nome}</h3>
                  <span className={`text-xs font-medium ${prioColor}`}>
                    {res.prioridade === 'alta' ? '🔴 Alta' : res.prioridade === 'media' ? '🟡 Média' : '🟢 Baixa'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDepositar(res)} className="text-c6-yellow hover:text-c6-yellow-light text-xs px-2 py-1">
                    + Depositar
                  </button>
                  <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-c6-gray-400">Guardado</span>
                  <span className="font-medium text-white">R$ {Number(res.valor_atual).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-c6-gray-400">Meta</span>
                  <span className="font-medium text-c6-yellow">R$ {Number(res.valor_meta).toFixed(2)}</span>
                </div>
                <div className="w-full bg-c6-gray-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-c6-yellow'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-xs text-c6-gray-500">{progress.toFixed(0)}% da meta atingida</p>
              </div>
            </div>
          );
        })}
        {reservas.length === 0 && (
          <div className="col-span-2 text-center py-16 text-c6-gray-500">
            <PiggyBank size={48} className="mx-auto mb-4 text-c6-gray-600" />
            <p className="text-lg mb-2">Nenhuma reserva criada</p>
            <p className="text-sm">Crie reservas de emergência, viagem, estudos e muito mais</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-c6-gray-900 rounded-c6 max-w-md w-full p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Nova Reserva</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Nome da Reserva</label>
                <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="input-c6" placeholder="Ex: Reserva de Emergência" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Meta</label>
                  <input type="number" value={formData.valor_meta} onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })} required step="0.01" min="0" className="input-c6" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-c6-gray-300 mb-2">Valor Atual</label>
                  <input type="number" value={formData.valor_atual} onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })} step="0.01" min="0" className="input-c6" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-c6-gray-300 mb-2">Prioridade</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baixa', 'media', 'alta'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setFormData({ ...formData, prioridade: p })}
                      className={`py-2 px-4 rounded-c6-sm font-medium text-sm transition-all ${
                        formData.prioridade === p
                          ? p === 'alta' ? 'bg-red-600 text-white' : p === 'media' ? 'bg-c6-yellow text-c6-black' : 'bg-green-600 text-white'
                          : 'bg-c6-gray-800 text-c6-gray-400'
                      }`}
                    >
                      {p === 'alta' ? '🔴 Alta' : p === 'media' ? '🟡 Média' : '🟢 Baixa'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-c6-gray-800 text-white rounded-c6-sm hover:bg-c6-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 btn-c6">Criar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
