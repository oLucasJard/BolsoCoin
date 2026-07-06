'use server';
import { getSheetData, appendRow, updateRow, deleteRow, findRowById, gerarId, Transacao } from './engine';

const SHEET = 'Transacoes';

export async function listar(): Promise<Transacao[]> {
  return getSheetData<Transacao>(SHEET);
}

export async function criar(data: Omit<Transacao, 'id'>): Promise<Transacao> {
  const item: Transacao = { id: gerarId(), ...data } as Transacao;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<Transacao>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function obter(id: string): Promise<Transacao | null> {
  return findRowById<Transacao>(SHEET, id);
}

export async function getDashboardStats() {
  const transacoes = await listar();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const monthTxs = transacoes.filter(t => t.data >= startOfMonth && t.data <= endOfMonth);
  const totalIncome = monthTxs.filter(t => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const totalExpense = monthTxs.filter(t => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);
  const balance = totalIncome - totalExpense;

  const categoryStats: Record<string, number> = {};
  monthTxs.filter(t => t.tipo === 'despesa').forEach(t => {
    const cat = t.categoria || 'Outros';
    categoryStats[cat] = (categoryStats[cat] || 0) + Number(t.valor);
  });
  const topCategories = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recentTransactions = transacoes.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  const totalBalance = transacoes.reduce((s, t) => {
    return t.tipo === 'receita' ? s + Number(t.valor) : s - Number(t.valor);
  }, 0);

  return { balance: totalBalance, totalIncome, totalExpense, topCategories, recentTransactions };
}
