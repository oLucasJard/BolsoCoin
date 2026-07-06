'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, Orcamento, MetaFinanceira } from './engine';

export async function listarOrcamentos(): Promise<Orcamento[]> {
  return getSheetData<Orcamento>('Orcamentos');
}

export async function criarOrcamento(data: Omit<Orcamento, 'id'>): Promise<Orcamento> {
  const item: Orcamento = { id: gerarId(), ...data } as Orcamento;
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
  const item: MetaFinanceira = { id: gerarId(), ...data } as MetaFinanceira;
  await appendRow('Metas', item);
  return item;
}

export async function atualizarMeta(id: string, data: Partial<MetaFinanceira>): Promise<void> {
  await updateRow('Metas', id, data);
}

export async function removerMeta(id: string): Promise<void> {
  await deleteRow('Metas', id);
}

export async function getBudgetComparison(mes: number, ano: number) {
  const orcamentos = await listarOrcamentos();
  const { listar } = await import('./transacoes');
  const transacoes = await listar();
  const monthTxs = transacoes.filter(t => {
    const d = new Date(t.data);
    return d.getMonth() + 1 === mes && d.getFullYear() === ano && t.tipo === 'despesa';
  });
  const spentByCategory: Record<string, number> = {};
  monthTxs.forEach(t => {
    const cat = t.categoria || 'Outros';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(t.valor);
  });
  const filtered = orcamentos.filter(o => Number(o.mes) === mes && Number(o.ano) === ano);
  return filtered.map(b => ({
    category: b.categoria,
    budget: Number(b.valor_limite),
    spent: spentByCategory[b.categoria] || 0,
    remaining: Number(b.valor_limite) - (spentByCategory[b.categoria] || 0),
    percentage: ((spentByCategory[b.categoria] || 0) / Number(b.valor_limite)) * 100,
  }));
}
