const { loadEnvConfig } = require('@next/env');
const { google } = require('googleapis');
const path = require('path');
const { SHEET_DEFS, HEADER_COLOR, INSTRUCTION_COLOR, ID_COLUMN_COLOR } = require('../lib/sheets/sheet-template');

loadEnvConfig(path.join(__dirname, '..'));

function normalizeEnv(value) {
  if (!value) return '';
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

function getSpreadsheetId() {
  let id = normalizeEnv(process.env.GOOGLE_SHEETS_ID);
  const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) id = match[1];
  return id;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    red: parseInt(h.slice(0, 2), 16) / 255,
    green: parseInt(h.slice(2, 4), 16) / 255,
    blue: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function colToLetter(col) {
  let letter = '';
  let c = col;
  while (c >= 0) {
    letter = String.fromCharCode((c % 26) + 65) + letter;
    c = Math.floor(c / 26) - 1;
  }
  return letter;
}

function buildFormatRequests(sheetId, def) {
  const requests = [];
  const headerBg = def.headerColor?.gs || HEADER_COLOR.gs;
  const isDark = def.name === 'Instrucoes';
  const lastCol = def.headers.length;

  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: { frozenRowCount: def.freezeRows || 0 },
        tabColor: hexToRgb(def.tabColor),
      },
      fields: 'gridProperties.frozenRowCount,tabColor',
    },
  });

  for (let i = 0; i < def.widths.length; i++) {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
        properties: { pixelSize: Math.round(def.widths[i] * 7) },
        fields: 'pixelSize',
      },
    });
  }

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: lastCol },
      cell: {
        userEnteredFormat: {
          backgroundColor: headerBg,
          textFormat: { bold: true, foregroundColor: isDark ? { red: 1, green: 1, blue: 1 } : { red: 0, green: 0, blue: 0 } },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
    },
  });

  if (def.idCol !== undefined) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: def.idCol, endColumnIndex: def.idCol + 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: ID_COLUMN_COLOR.gs,
            textFormat: { foregroundColor: { red: 0.4, green: 0.4, blue: 0.4 }, fontSize: 10 },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    });
  }

  if (def.currencyCols) {
    for (const col of def.currencyCols) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: 'R$ #,##0.00' } } },
          fields: 'userEnteredFormat.numberFormat',
        },
      });
    }
  }

  if (def.dateCols) {
    for (const col of def.dateCols) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'dd/mm/yyyy' } } },
          fields: 'userEnteredFormat.numberFormat',
        },
      });
    }
  }

  if (def.validations) {
    for (const v of def.validations) {
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: v.col, endColumnIndex: v.col + 1 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: v.values.map((val) => ({ userEnteredValue: val })) },
            showCustomUi: true,
            strict: false,
            inputMessage: `Valores: ${v.values.join(', ')}`,
          },
        },
      });
    }
  }

  if (def.name !== 'Instrucoes') {
    requests.push({
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: lastCol } },
      },
    });
  }

  return requests;
}

async function init() {
  const spreadsheetId = getSpreadsheetId();
  const credentialsJson = normalizeEnv(process.env.GOOGLE_SHEETS_CREDENTIALS);

  if (!spreadsheetId || !credentialsJson) {
    console.error('❌ Configure GOOGLE_SHEETS_ID e GOOGLE_SHEETS_CREDENTIALS no .env');
    process.exit(1);
  }

  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  let meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Map(meta.data.sheets.map((s) => [s.properties.title, s.properties.sheetId]));

  const toAdd = SHEET_DEFS.filter((def) => !existing.has(def.name));
  if (toAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: toAdd.map((def) => ({
          addSheet: { properties: { title: def.name, tabColor: hexToRgb(def.tabColor) } },
        })),
      },
    });
    meta = await sheets.spreadsheets.get({ spreadsheetId });
    meta.data.sheets.forEach((s) => existing.set(s.properties.title, s.properties.sheetId));
    console.log('✅ Abas criadas:', toAdd.map((d) => d.name).join(', '));
  }

  const reorderRequests = [];
  SHEET_DEFS.forEach((def, index) => {
    const sheetId = existing.get(def.name);
    if (sheetId !== undefined) {
      reorderRequests.push({
        updateSheetProperties: {
          properties: { sheetId, index },
          fields: 'index',
        },
      });
    }
  });

  if (reorderRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: reorderRequests } });
  }

  const allFormatRequests = [];

  for (const def of SHEET_DEFS) {
    const sheetId = existing.get(def.name);
    if (sheetId === undefined) continue;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${def.name}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [def.headers] },
    });

    if (def.seedRows?.length) {
      const dataCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${def.name}!A2:A5`,
      });
      const hasData = dataCheck.data.values?.some((row) => row.some(Boolean));
      if (def.forceSeed || !hasData) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${def.name}!A2`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: def.seedRows },
        });
        console.log(`✅ Dados iniciais em: ${def.name}`);
      }
    }

    allFormatRequests.push(...buildFormatRequests(sheetId, def));
    console.log(`✅ Formatação aplicada em: ${def.name}`);
  }

  const CHUNK = 80;
  for (let i = 0; i < allFormatRequests.length; i += CHUNK) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: allFormatRequests.slice(i, i + CHUNK) },
    });
  }

  console.log(`\n🎉 Planilha organizada: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  console.log('📋 Abra a aba "Instrucoes" para ver o guia de preenchimento.');
}

init().catch((error) => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
