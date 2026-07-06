/** Utilitários compartilhados para leitura/escrita de planilhas */

const HEADER_ALIASES: Record<string, string> = {
  categoria: 'nome', // aba Config
};

export function headerToKey(header: string): string {
  const normalized = header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return HEADER_ALIASES[normalized] || normalized;
}

export function normalizeTipo(value: unknown): 'receita' | 'despesa' {
  const v = String(value ?? '').toLowerCase().trim();
  if (v === 'receita' || v === 'income') return 'receita';
  return 'despesa';
}

export function normalizeAtivo(value: unknown): boolean {
  const v = String(value ?? '').toLowerCase().trim();
  return v === 'true' || v === 'sim' || v === '1' || value === true;
}

export function ativoToSheet(value: unknown): string {
  return normalizeAtivo(value) ? 'sim' : 'não';
}

export function parseSheetNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  let s = String(value).trim().replace(/[R$\s]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/** Converte data da planilha para YYYY-MM-DD */
export function parseSheetDate(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  const s = String(value).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return s;
}

export function isDateInMonth(dateStr: string, mes: number, ano: number): boolean {
  const iso = parseSheetDate(dateStr);
  if (!iso) return false;
  const [y, m] = iso.split('-').map(Number);
  return y === ano && m === mes;
}

export function compareDatesDesc(a: string, b: string): number {
  return parseSheetDate(b).localeCompare(parseSheetDate(a));
}

export function colIndexToLetter(col: number): string {
  let letter = '';
  let c = col;
  while (c >= 0) {
    letter = String.fromCharCode((c % 26) + 65) + letter;
    c = Math.floor(c / 26) - 1;
  }
  return letter;
}

/** Gera data de vencimento válida para o mês atual */
export function dataVencimentoRecorrente(diaVencimento: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(Math.max(1, diaVencimento), lastDay);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
