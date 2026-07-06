'use server';
import { getSheetData, appendRow, updateRow, deleteRow, findRowById, gerarId, CartaoCredito } from './engine';

const SHEET = 'CartoesCredito';

export async function listar(): Promise<CartaoCredito[]> {
  return getSheetData<CartaoCredito>(SHEET);
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
  return findRowById<CartaoCredito>(SHEET, id);
}

export async function getLimiteTotal(): Promise<number> {
  const cartoes = await listar();
  return cartoes.reduce((s, c) => s + Number(c.limite_total), 0);
}

export async function getLimiteUtilizadoTotal(): Promise<number> {
  const cartoes = await listar();
  return cartoes.reduce((s, c) => s + Number(c.limite_utilizado), 0);
}
