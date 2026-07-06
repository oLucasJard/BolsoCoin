'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, CobrancaRecorrente } from './engine';

const SHEET = 'CobrancasRecorrentes';

export async function listar(): Promise<CobrancaRecorrente[]> {
  return getSheetData<CobrancaRecorrente>(SHEET);
}

export async function criar(data: Omit<CobrancaRecorrente, 'id'>): Promise<CobrancaRecorrente> {
  const item: CobrancaRecorrente = { id: gerarId(), ...data } as CobrancaRecorrente;
  await appendRow(SHEET, item);
  return item;
}

export async function atualizar(id: string, data: Partial<CobrancaRecorrente>): Promise<void> {
  await updateRow(SHEET, id, data);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function getRecorrentesAtivos(): Promise<CobrancaRecorrente[]> {
  const lista = await listar();
  return lista.filter(r => r.ativo === true || r.ativo === 'true' || r.ativo === 'sim');
}

export async function getTotalMensal(): Promise<number> {
  const ativos = await getRecorrentesAtivos();
  return ativos.reduce((s, r) => {
    const val = Number(r.valor);
    if (r.tipo_recorrencia === 'anual') return s + val / 12;
    if (r.tipo_recorrencia === 'semanal') return s + val * 4.33;
    return s + val;
  }, 0);
}
