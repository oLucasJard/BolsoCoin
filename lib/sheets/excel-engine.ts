import 'server-only';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { SHEET_DEFS, HEADER_COLOR, ID_COLUMN_COLOR } from './sheet-template';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'bolsocoin.xlsx');

type SheetDef = (typeof SHEET_DEFS)[number];

type WorksheetWithValidations = ExcelJS.Worksheet & {
  dataValidations: {
    add: (
      range: string,
      rule: {
        type: string;
        allowBlank?: boolean;
        formulae?: string[];
        showErrorMessage?: boolean;
        errorTitle?: string;
        error?: string;
      }
    ) => void;
  };
};

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
};

function headerStyle(def: SheetDef): Partial<ExcelJS.Style> {
  const bg = def.headerColor?.argb || HEADER_COLOR.argb;
  const isDark = bg === '2D2D2D';
  return {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    font: { bold: true, color: { argb: isDark ? 'FFFFFFFF' : 'FF000000' }, size: 11 },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: BORDER,
  };
}

function aplicarValidacoes(ws: ExcelJS.Worksheet, def: SheetDef) {
  if (!def.validations) return;
  const sheet = ws as WorksheetWithValidations;
  for (const v of def.validations) {
    const col = v.col + 1;
    const colLetter = ws.getColumn(col).letter;
    sheet.dataValidations.add(`${colLetter}2:${colLetter}5000`, {
      type: 'list',
      allowBlank: true,
      formulae: [`"${v.values.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: `Use um dos valores: ${v.values.join(', ')}`,
    });
  }
}

function formatarAba(ws: ExcelJS.Worksheet, def: SheetDef) {
  def.headers.forEach((h, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = h;
    cell.style = headerStyle(def);
  });
  def.widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  if (def.freezeRows) {
    ws.views = [{ state: 'frozen', ySplit: def.freezeRows, activeCell: 'A2' }];
  }

  if (def.currencyCols) {
    for (const col of def.currencyCols) {
      ws.getColumn(col + 1).numFmt = 'R$ #,##0.00';
    }
  }
  if (def.dateCols) {
    for (const col of def.dateCols) {
      ws.getColumn(col + 1).numFmt = 'dd/mm/yyyy';
    }
  }
  if (def.idCol !== undefined) {
    ws.getColumn(def.idCol + 1).eachCell({ includeEmpty: true }, (cell, row) => {
      if (row === 1) return;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ID_COLUMN_COLOR.argb } };
      cell.font = { color: { argb: 'FF666666' }, size: 10 };
    });
  }

  aplicarValidacoes(ws, def);

  if (def.seedRows?.length) {
    def.seedRows.forEach((row, idx) => {
      const r = ws.getRow(idx + 2);
      row.forEach((val, colIdx) => { r.getCell(colIdx + 1).value = val; });
      if (def.name !== 'Instrucoes') {
        r.eachCell((cell) => {
          cell.border = BORDER;
          cell.alignment = { vertical: 'middle' };
        });
      }
    });
  }

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: def.headers.length } };
}

function criarTemplate(wb: ExcelJS.Workbook): void {
  wb.creator = 'BolsoCoin';
  wb.created = new Date();
  for (const def of SHEET_DEFS) {
    const ws = wb.addWorksheet(def.name, {
      properties: { tabColor: { argb: `FF${def.tabColor.replace('#', '')}` } },
    });
    formatarAba(ws, def);
  }
}

export async function getWorkbook(): Promise<ExcelJS.Workbook> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) {
    const wb = new ExcelJS.Workbook();
    criarTemplate(wb);
    await wb.xlsx.writeFile(FILE_PATH);
    return wb;
  }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE_PATH);
  return wb;
}

export async function saveWorkbook(wb: ExcelJS.Workbook): Promise<void> {
  await wb.xlsx.writeFile(FILE_PATH);
}

export function sheetToJSON<T>(sheet: ExcelJS.Worksheet): T[] {
  const rows: T[] = [];
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell) => headers.push(String(cell.value || '')));
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const firstCell = row.getCell(1).value;
    if (!firstCell) continue;
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const cell = row.getCell(idx + 1);
      let val: ExcelJS.CellValue = cell.value;
      if (val && typeof val === 'object' && 'result' in val) {
        val = (val as { result: ExcelJS.CellValue }).result;
      }
      const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      obj[key] = val ?? '';
    });
    rows.push(obj as T);
  }
  return rows;
}

export function appendRow(sheet: ExcelJS.Worksheet, data: Record<string, unknown>): void {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell) => headers.push(String(cell.value || '')));
  const values = headers.map(h => {
    const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return data[key] !== undefined ? data[key] : '';
  });
  sheet.addRow(values);
}

export function updateRow(sheet: ExcelJS.Worksheet, id: string, data: Record<string, unknown>): void {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell) => headers.push(String(cell.value || '')));
  const idCol = headers.findIndex(h => h.toLowerCase() === 'id');
  if (idCol === -1) return;
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const cellVal = row.getCell(idCol + 1).value;
    const rowId = cellVal && typeof cellVal === 'object' && 'result' in cellVal
      ? (cellVal as { result: string }).result : String(cellVal || '');
    if (rowId === id) {
      headers.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (data[key] !== undefined) row.getCell(idx + 1).value = data[key] as ExcelJS.CellValue;
      });
      row.commit();
      return;
    }
  }
}

export function deleteRow(sheet: ExcelJS.Worksheet, id: string): void {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell) => headers.push(String(cell.value || '')));
  const idCol = headers.findIndex(h => h.toLowerCase() === 'id');
  if (idCol === -1) return;
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const cellVal = row.getCell(idCol + 1).value;
    const rowId = cellVal && typeof cellVal === 'object' && 'result' in cellVal
      ? (cellVal as { result: string }).result : String(cellVal || '');
    if (rowId === id) {
      sheet.spliceRows(i, 1);
      return;
    }
  }
}

export function findRowById<T>(sheet: ExcelJS.Worksheet, id: string): T | null {
  const data = sheetToJSON<T>(sheet);
  return data.find((item) => (item as { id?: string }).id === id) || null;
}
