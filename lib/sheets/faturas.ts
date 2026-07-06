'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, FaturaCartao } from './engine';
import { parseSheetNumber, parseSheetDate } from './utils';

const SHEET = 'Faturas';

function normalizeFatura(f: FaturaCartao): FaturaCartao {
  return {
    ...f,
    valor_total: parseSheetNumber(f.valor_total),
    valor_pago: parseSheetNumber(f.valor_pago),
    data_vencimento: parseSheetDate(f.data_vencimento),
  };
}

export async function listar(): Promise<FaturaCartao[]> {
  const rows = await getSheetData<FaturaCartao>(SHEET);
  return rows.map(normalizeFatura);
}

export async function criar(data: Omit<FaturaCartao, 'id'>): Promise<FaturaCartao> {
  const item: FaturaCartao = { id: gerarId(), ...data } as FaturaCartao;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<FaturaCartao>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function listarPorCartao(cartaoId: string): Promise<FaturaCartao[]> {
  const faturas = await listar();
  return faturas.filter(f => f.cartao_id === cartaoId);
}

export async function getFaturaAberta(cartaoId: string): Promise<FaturaCartao | null> {
  const faturas = await listar();
  return faturas.find(f => f.cartao_id === cartaoId && f.status === 'aberta') || null;
}
