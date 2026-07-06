import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import { SheetBackend } from './types';
import { googleSheetsBackend } from './google-engine';
import * as excel from './excel-engine';

function isGoogleSheetsEnabled(): boolean {
  return !!(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_CREDENTIALS);
}

function getBackend(): SheetBackend {
  if (isGoogleSheetsEnabled()) {
    console.log('[BolsoCoin] Usando Google Sheets API');
    return googleSheetsBackend;
  }
  console.log('[BolsoCoin] Usando Excel local');
  return excelBackend;
}

const excelBackend: SheetBackend = {
  async getSheetData<T>(sheetName: string): Promise<T[]> {
    const wb = await excel.getWorkbook();
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) return [];
    return excel.sheetToJSON<T>(sheet);
  },

  async appendRow(sheetName: string, data: Record<string, any>): Promise<void> {
    const wb = await excel.getWorkbook();
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) throw new Error(`Planilha ${sheetName} não encontrada`);
    excel.appendRow(sheet, data);
    await excel.saveWorkbook(wb);
  },

  async updateRow(sheetName: string, id: string, data: Record<string, any>): Promise<void> {
    const wb = await excel.getWorkbook();
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) throw new Error(`Planilha ${sheetName} não encontrada`);
    excel.updateRow(sheet, id, data);
    await excel.saveWorkbook(wb);
  },

  async deleteRow(sheetName: string, id: string): Promise<void> {
    const wb = await excel.getWorkbook();
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) throw new Error(`Planilha ${sheetName} não encontrada`);
    excel.deleteRow(sheet, id);
    await excel.saveWorkbook(wb);
  },

  async findRowById<T>(sheetName: string, id: string): Promise<T | null> {
    const wb = await excel.getWorkbook();
    const sheet = wb.getWorksheet(sheetName);
    if (!sheet) return null;
    return excel.findRowById<T>(sheet, id);
  },
};

const backend = getBackend();

export async function getSheetData<T>(sheetName: string): Promise<T[]> {
  return backend.getSheetData<T>(sheetName);
}

export async function appendRow(sheetName: string, data: Record<string, any>): Promise<void> {
  return backend.appendRow(sheetName, data);
}

export async function updateRow(sheetName: string, id: string, data: Record<string, any>): Promise<void> {
  return backend.updateRow(sheetName, id, data);
}

export async function deleteRow(sheetName: string, id: string): Promise<void> {
  return backend.deleteRow(sheetName, id);
}

export async function findRowById<T>(sheetName: string, id: string): Promise<T | null> {
  return backend.findRowById<T>(sheetName, id);
}

export function gerarId(): string {
  return uuidv4();
}

export type {
  Transacao, CartaoCredito, FaturaCartao, CobrancaRecorrente,
  Investimento, Reserva, Orcamento, MetaFinanceira, CategoriaConfig,
} from './types';

export { isGoogleSheetsEnabled };
