'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, Orcamento, MetaFinanceira } from './engine';
import { parseSheetNumber, isDateInMonth } from './utils';
import { normalizeTipo } from './utils';

export async function listarOrcamentos(): Promise<Orcamento[]> {
  return getSheetData<Orcamento>('Orcamentos');
}

export async function criarOrcamento(data: Omit<Orcamento, 'id'>): Promise<Orcamento> {
  const item: Orcamento = {
    id: gerarId(),
    ...data,
    valor_limite: parseSheetNumber(data.valor_limite),
  } as Orcamento;
  await appendRow('Orcamentos', item);
  return item;
}

export async function removerOrcamento(id: string): Promise<void> {
  await deleteRow('Orcamentos', id);
}

export async function listarMetas(): Promise<MetaFinanceira[]> {
  return getSheetData<MetaFinanceira>('Metas');
}

export async function criarMeta(data: Omit<MetaFinanceira, 'id'>): Promise<MetaFinanceira> {
  const item: MetaFinanceira = {
    id: gerarId(),
    ...data,
    valor_alvo: parseSheetNumber(data.valor_alvo),
    valor_atual: parseSheetNumber(data.valor_atual),
  } as MetaFinanceira;
  await appendRow('Metas', item);
  return item;
}

export async function atualizarMeta(id: string, data: Partial<MetaFinanceira>): Promise<void> {
  const patch: Partial<MetaFinanceira> = { ...data };
  if (data.valor_alvo !== undefined) patch.valor_alvo = parseSheetNumber(data.valor_alvo);
  if (data.valor_atual !== undefined) patch.valor_atual = parseSheetNumber(data.valor_atual);
  await updateRow('Metas', id, patch);
}

export async function removerMeta(id: string): Promise<void> {
  await deleteRow('Metas', id);
}

export async function getBudgetComparison(mes: number, ano: number) {
  const orcamentos = await listarOrcamentos();
  const { listar } = await import('./transacoes');
  const transacoes = await listar();
  const monthTxs = transacoes.filter(
    (t) => isDateInMonth(t.data, mes, ano) && normalizeTipo(t.tipo) === 'despesa'
  );
  const spentByCategory: Record<string, number> = {};
  monthTxs.forEach((t) => {
    const cat = t.categoria || 'Outros';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + parseSheetNumber(t.valor);
  });
  const filtered = orcamentos.filter((o) => Number(o.mes) === mes && Number(o.ano) === ano);
  return filtered.map((b) => {
    const budget = parseSheetNumber(b.valor_limite);
    const spent = spentByCategory[b.categoria] || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      category: b.categoria,
      budget,
      spent,
      remaining: budget - spent,
      percentage,
      id: b.id,
    };
  });
}
