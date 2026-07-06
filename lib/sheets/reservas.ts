'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, Reserva } from './engine';
import { parseSheetNumber, parseSheetDate } from './utils';

const SHEET = 'Reservas';

function normalizeReserva(r: Reserva): Reserva {
  return {
    ...r,
    valor_meta: parseSheetNumber(r.valor_meta),
    valor_atual: parseSheetNumber(r.valor_atual),
    data_criacao: parseSheetDate(r.data_criacao),
  };
}

export async function listar(): Promise<Reserva[]> {
  const rows = await getSheetData<Reserva>(SHEET);
  return rows.map(normalizeReserva);
}

export async function criar(data: Omit<Reserva, 'id'>): Promise<Reserva> {
  const item: Reserva = { id: gerarId(), ...data } as Reserva;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<Reserva>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function getTotalMeta(): Promise<number> {
  const lista = await listar();
  return lista.reduce((s, r) => s + Number(r.valor_meta), 0);
}

export async function getTotalAtual(): Promise<number> {
  const lista = await listar();
  return lista.reduce((s, r) => s + Number(r.valor_atual), 0);
}
