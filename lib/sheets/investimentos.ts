'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, Investimento } from './engine';
import { parseSheetNumber, parseSheetDate } from './utils';

const SHEET = 'Investimentos';

function normalizeInvestimento(i: Investimento): Investimento {
  return {
    ...i,
    valor_aplicado: parseSheetNumber(i.valor_aplicado),
    valor_atual: parseSheetNumber(i.valor_atual),
    data_aplicacao: parseSheetDate(i.data_aplicacao),
  };
}

export async function listar(): Promise<Investimento[]> {
  const rows = await getSheetData<Investimento>(SHEET);
  return rows.map(normalizeInvestimento);
}

export async function criar(data: Omit<Investimento, 'id'>): Promise<Investimento> {
  const item: Investimento = { id: gerarId(), ...data } as Investimento;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<Investimento>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function getTotalAplicado(): Promise<number> {
  const lista = await listar();
  return lista.reduce((s, i) => s + Number(i.valor_aplicado), 0);
}

export async function getTotalAtual(): Promise<number> {
  const lista = await listar();
  return lista.reduce((s, i) => s + Number(i.valor_atual), 0);
}
