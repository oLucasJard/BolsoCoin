'use server';
import { getSheetData, appendRow, updateRow, deleteRow, findRowById, gerarId, Transacao } from './engine';
import {
  normalizeTipo,
  parseSheetNumber,
  parseSheetDate,
  isDateInMonth,
  compareDatesDesc,
} from './utils';

const SHEET = 'Transacoes';

function normalizeTransacao(t: Transacao): Transacao {
  return {
    ...t,
    tipo: normalizeTipo(t.tipo),
    valor: parseSheetNumber(t.valor),
    data: parseSheetDate(t.data),
  };
}

export async function listar(): Promise<Transacao[]> {
  const rows = await getSheetData<Transacao>(SHEET);
  return rows.map(normalizeTransacao);
}

export async function criar(data: Omit<Transacao, 'id'>): Promise<Transacao> {
  const item: Transacao = normalizeTransacao({
    id: gerarId(),
    ...data,
    tipo: normalizeTipo(data.tipo),
    data: parseSheetDate(data.data) || new Date().toISOString().split('T')[0],
  } as Transacao);
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<Transacao>): Promise<void> {
  const patch: Partial<Transacao> = { ...data };
  if (data.tipo !== undefined) patch.tipo = normalizeTipo(data.tipo);
  if (data.valor !== undefined) patch.valor = parseSheetNumber(data.valor);
  if (data.data !== undefined) patch.data = parseSheetDate(data.data);
  await updateRow(SHEET, id, patch);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function obter(id: string): Promise<Transacao | null> {
  const row = await findRowById<Transacao>(SHEET, id);
  return row ? normalizeTransacao(row) : null;
}

export async function getDashboardStats() {
  const transacoes = await listar();
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const monthTxs = transacoes.filter((t) => isDateInMonth(t.data, mes, ano));
  const totalIncome = monthTxs
    .filter((t) => t.tipo === 'receita')
    .reduce((s, t) => s + parseSheetNumber(t.valor), 0);
  const totalExpense = monthTxs
    .filter((t) => t.tipo === 'despesa')
    .reduce((s, t) => s + parseSheetNumber(t.valor), 0);
  const balance = totalIncome - totalExpense;

  const categoryStats: Record<string, number> = {};
  monthTxs.filter((t) => t.tipo === 'despesa').forEach((t) => {
    const cat = t.categoria || 'Outros';
    categoryStats[cat] = (categoryStats[cat] || 0) + parseSheetNumber(t.valor);
  });
  const topCategories = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recentTransactions = [...transacoes]
    .sort((a, b) => compareDatesDesc(a.data, b.data))
    .slice(0, 5);

  const totalBalance = transacoes.reduce((s, t) => {
    const val = parseSheetNumber(t.valor);
    return t.tipo === 'receita' ? s + val : s - val;
  }, 0);

  return {
    balance,
    totalBalance,
    totalIncome,
    totalExpense,
    topCategories,
    recentTransactions,
  };
}
