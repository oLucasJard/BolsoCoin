import 'server-only';
import { google, sheets_v4 } from 'googleapis';
import { SheetBackend } from './types';

function normalizeEnv(value: string | undefined): string {
  if (!value) return '';
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

function getAuth() {
  const credentialsJson = normalizeEnv(process.env.GOOGLE_SHEETS_CREDENTIALS);
  if (!credentialsJson) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS não configurado');
  }
  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS inválido. Cole o JSON da service account em uma única linha.');
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

function getSpreadsheetId(): string {
  let id = normalizeEnv(process.env.GOOGLE_SHEETS_ID);
  const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) id = match[1];
  if (!id) throw new Error('GOOGLE_SHEETS_ID não configurado');
  return id;
}

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = await getAuth();
  return google.sheets({ version: 'v4', auth });
}

function sheetNameToRange(sheetName: string): string {
  const map: Record<string, string> = {
    Transacoes: 'Transacoes!A:J',
    CartoesCredito: 'CartoesCredito!A:H',
    Faturas: 'Faturas!A:H',
    CobrancasRecorrentes: 'CobrancasRecorrentes!A:I',
    Investimentos: 'Investimentos!A:H',
    Reservas: 'Reservas!A:F',
    Orcamentos: 'Orcamentos!A:E',
    Metas: 'Metas!A:G',
    Config: 'Config!A:C',
  };
  return map[sheetName] || `${sheetName}!A:Z`;
}

function rowsToObjects<T>(headers: string[], rows: any[][]): T[] {
  const result: T[] = [];
  for (const row of rows) {
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      obj[key] = row[idx] !== undefined && row[idx] !== null ? row[idx] : '';
    });
    if (obj.id) result.push(obj as unknown as T);
  }
  return result;
}

function objectToRow(headers: string[], data: Record<string, any>): any[] {
  return headers.map(h => {
    const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return data[key] !== undefined ? data[key] : '';
  });
}

function getHeadersFromEnv(sheetName: string): string[] {
  const map: Record<string, string[]> = {
    Transacoes: ['ID', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Fornecedor', 'Data', 'Forma Pagamento', 'Observação', 'Status'],
    CartoesCredito: ['ID', 'Bandeira', 'Nome', 'Limite Total', 'Limite Utilizado', 'Data Fechamento', 'Data Vencimento', 'Cor'],
    Faturas: ['ID', 'Cartão ID', 'Mês', 'Ano', 'Valor Total', 'Valor Pago', 'Status', 'Data Vencimento'],
    CobrancasRecorrentes: ['ID', 'Descrição', 'Valor', 'Categoria', 'Fornecedor', 'Dia Vencimento', 'Tipo Recorrência', 'Ativo', 'Último Pagamento'],
    Investimentos: ['ID', 'Nome', 'Tipo', 'Valor Aplicado', 'Valor Atual', 'Data Aplicação', 'Instituição', 'Rentabilidade'],
    Reservas: ['ID', 'Nome', 'Valor Meta', 'Valor Atual', 'Data Criação', 'Prioridade'],
    Orcamentos: ['ID', 'Categoria', 'Valor Limite', 'Mês', 'Ano'],
    Metas: ['ID', 'Título', 'Descrição', 'Valor Alvo', 'Valor Atual', 'Prazo', 'Status'],
    Config: ['Categoria', 'Tipo', 'Ícone'],
  };
  return map[sheetName] || [];
}

export const googleSheetsBackend: SheetBackend = {
  async getSheetData<T>(sheetName: string): Promise<T[]> {
    try {
      const sheets = await getSheetsClient();
      const range = sheetNameToRange(sheetName);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range,
      });
      const values = response.data.values || [];
      if (values.length < 2) return [];
      const headers = values[0] as string[];
      const rows = values.slice(1);
      return rowsToObjects<T>(headers, rows);
    } catch (error: any) {
      if (error.message?.includes('Unable to parse range')) {
        console.warn(`[GoogleSheets] Aba ${sheetName} não encontrada. Execute: node scripts/init-google-sheet.js`);
        return [];
      }
      console.error(`[GoogleSheets] Erro ao ler ${sheetName}:`, error.message);
      throw error;
    }
  },

  async appendRow(sheetName: string, data: Record<string, any>): Promise<void> {
    try {
      const sheets = await getSheetsClient();
      const headers = getHeadersFromEnv(sheetName);
      const row = objectToRow(headers, data);
      await sheets.spreadsheets.values.append({
        spreadsheetId: getSpreadsheetId(),
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });
    } catch (error: any) {
      console.error(`[GoogleSheets] Erro ao adicionar em ${sheetName}:`, error.message);
      throw error;
    }
  },

  async updateRow(sheetName: string, id: string, data: Record<string, any>): Promise<void> {
    try {
      const sheets = await getSheetsClient();
      const range = sheetNameToRange(sheetName);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range,
      });
      const values = response.data.values || [];
      if (values.length < 2) return;
      const headers = values[0] as string[];
      const idCol = headers.findIndex(h => h.toLowerCase() === 'id');
      if (idCol === -1) return;

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][idCol] || '') === id) {
          const updateRange = `${sheetName}!A${i + 1}`;
          const existingRow = values[i];
          const newRow = headers.map((h, idx) => {
            const key = h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            return data[key] !== undefined ? data[key] : (existingRow[idx] || '');
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId: getSpreadsheetId(),
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRow] },
          });
          return;
        }
      }
    } catch (error: any) {
      console.error(`[GoogleSheets] Erro ao atualizar ${sheetName}:`, error.message);
      throw error;
    }
  },

  async deleteRow(sheetName: string, id: string): Promise<void> {
    try {
      const sheets = await getSheetsClient();
      const range = sheetNameToRange(sheetName);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range,
      });
      const values = response.data.values || [];
      if (values.length < 2) return;
      const headers = values[0] as string[];
      const idCol = headers.findIndex(h => h.toLowerCase() === 'id');
      if (idCol === -1) return;

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][idCol] || '') === id) {
          const rowIndex = i + 1;
          const lastRow = values.length;
          if (rowIndex < lastRow) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: getSpreadsheetId(),
              requestBody: {
                requests: [{
                  deleteDimension: {
                    range: {
                      sheetId: 0,
                      dimension: 'ROWS',
                      startIndex: rowIndex - 1,
                      endIndex: rowIndex,
                    },
                  },
                }],
              },
            });
          } else {
            await sheets.spreadsheets.values.update({
              spreadsheetId: getSpreadsheetId(),
              range: `${sheetName}!A${rowIndex}:${String.fromCharCode(64 + headers.length)}${rowIndex}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: [headers.map(() => '')] },
            });
          }
          return;
        }
      }
    } catch (error: any) {
      console.error(`[GoogleSheets] Erro ao excluir ${sheetName}:`, error.message);
      throw error;
    }
  },

  async findRowById<T>(sheetName: string, id: string): Promise<T | null> {
    const data = await this.getSheetData<T>(sheetName);
    return data.find((item: any) => String(item.id) === id) || null;
  },
};
