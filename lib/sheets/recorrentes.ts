'use server';
import { getSheetData, appendRow, updateRow, deleteRow, gerarId, CobrancaRecorrente } from './engine';
import { normalizeAtivo, ativoToSheet, parseSheetNumber, parseSheetDate } from './utils';

const SHEET = 'CobrancasRecorrentes';

function normalizeRecorrente(r: CobrancaRecorrente): CobrancaRecorrente {
  return {
    ...r,
    valor: parseSheetNumber(r.valor),
    ativo: normalizeAtivo(r.ativo),
    ultimo_pagamento: parseSheetDate(r.ultimo_pagamento),
  };
}

export async function listar(): Promise<CobrancaRecorrente[]> {
  const rows = await getSheetData<CobrancaRecorrente>(SHEET);
  return rows.map(normalizeRecorrente);
}

export async function criar(data: Omit<CobrancaRecorrente, 'id'>): Promise<CobrancaRecorrente> {
  const item: CobrancaRecorrente = {
    id: gerarId(),
    ...data,
    valor: parseSheetNumber(data.valor),
    ativo: ativoToSheet(data.ativo),
    ultimo_pagamento: data.ultimo_pagamento ? parseSheetDate(data.ultimo_pagamento) : '',
  } as CobrancaRecorrente;
  await appendRow(SHEET, item);
  return normalizeRecorrente(item);
}

export async function atualizar(id: string, data: Partial<CobrancaRecorrente>): Promise<void> {
  const patch: Partial<CobrancaRecorrente> = { ...data };
  if (data.valor !== undefined) patch.valor = parseSheetNumber(data.valor);
  if (data.ativo !== undefined) patch.ativo = ativoToSheet(data.ativo);
  if (data.ultimo_pagamento !== undefined) patch.ultimo_pagamento = parseSheetDate(data.ultimo_pagamento);
  await updateRow(SHEET, id, patch);
}

export async function remover(id: string): Promise<void> {
  await deleteRow(SHEET, id);
}

export async function getRecorrentesAtivos(): Promise<CobrancaRecorrente[]> {
  const lista = await listar();
  return lista.filter((r) => normalizeAtivo(r.ativo));
}

export async function getTotalMensal(): Promise<number> {
  const ativos = await getRecorrentesAtivos();
  return ativos.reduce((s, r) => {
    const val = parseSheetNumber(r.valor);
    if (r.tipo_recorrencia === 'anual') return s + val / 12;
    if (r.tipo_recorrencia === 'semanal') return s + val * 4.33;
    return s + val;
  }, 0);
}
