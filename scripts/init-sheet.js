const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { SHEET_DEFS, HEADER_COLOR, ID_COLUMN_COLOR } = require('../lib/sheets/sheet-template');

const BORDER = {
  top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
};

function headerStyle(def) {
  const bg = def.headerColor?.argb || HEADER_COLOR.argb;
  const isDark = bg === '2D2D2D';
  return {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    font: { bold: true, color: { argb: isDark ? 'FFFFFFFF' : 'FF000000' }, size: 11 },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: BORDER,
  };
}

function aplicarValidacoes(ws, def) {
  if (!def.validations) return;
  for (const v of def.validations) {
    const col = v.col + 1;
    const colLetter = ws.getColumn(col).letter;
    ws.dataValidations.add(`${colLetter}2:${colLetter}5000`, {
      type: 'list',
      allowBlank: true,
      formulae: [`"${v.values.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: `Use um dos valores: ${v.values.join(', ')}`,
    });
  }
}

function formatarAba(ws, def) {
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

async function init() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BolsoCoin';
  wb.created = new Date();

  for (const def of SHEET_DEFS) {
    const ws = wb.addWorksheet(def.name, {
      properties: { tabColor: { argb: `FF${def.tabColor.replace('#', '')}` } },
    });
    formatarAba(ws, def);
  }

  const dir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'bolsocoin.xlsx');
  await wb.xlsx.writeFile(filePath);
  console.log('✅ Planilha criada em:', filePath);
}

init().catch(console.error);
