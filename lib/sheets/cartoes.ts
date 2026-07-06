'use server';
import { getSheetData, appendRow, updateRow, deleteRow, findRowById, gerarId, CartaoCredito } from './engine';
import { parseSheetNumber } from './utils';

const SHEET = 'CartoesCredito';

function normalizeCartao(c: CartaoCredito): CartaoCredito {
  return {
    ...c,
    limite_total: parseSheetNumber(c.limite_total),
    limite_utilizado: parseSheetNumber(c.limite_utilizado),
  };
}

export async function listar(): Promise<CartaoCredito[]> {
  const rows = await getSheetData<CartaoCredito>(SHEET);
  return rows.map(normalizeCartao);
}

export async function criar(data: Omit<CartaoCredito, 'id'>): Promise<CartaoCredito> {
  const item: CartaoCredito = { id: gerarId(), ...data } as CartaoCredito;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<CartaoCredito>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function obter(id: string): Promise<CartaoCredito | null> {
  const row = await findRowById<CartaoCredito>(SHEET, id);
  return row ? normalizeCartao(row) : null;
}

export async function getLimiteTotal(): Promise<number> {
  const cartoes = await listar();
  return cartoes.reduce((s, c) => s + Number(c.limite_total), 0);
}

export async function getLimiteUtilizadoTotal(): Promise<number> {
  const cartoes = await listar();
  return cartoes.reduce((s, c) => s + Number(c.limite_utilizado), 0);
}
