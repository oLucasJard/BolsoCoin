import 'server-only';
import { google, sheets_v4 } from 'googleapis';
import { SheetBackend } from './types';
import { headerToKey, colIndexToLetter } from './utils';

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

let sheetIdCache: Map<string, number> | null = null;

async function getSheetId(sheetName: string): Promise<number> {
  if (!sheetIdCache) {
    const sheets = await getSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
    sheetIdCache = new Map(
      (meta.data.sheets || []).map((s) => [s.properties!.title!, s.properties!.sheetId!])
    );
  }
  const id = sheetIdCache.get(sheetName);
  if (id === undefined) throw new Error(`Aba ${sheetName} não encontrada na planilha`);
  return id;
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

function rowsToObjects<T>(headers: string[], rows: unknown[][]): T[] {
  const result: T[] = [];
  for (const row of rows) {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const key = headerToKey(h);
      obj[key] = row[idx] !== undefined && row[idx] !== null ? row[idx] : '';
    });
    if (obj.id) result.push(obj as T);
  }
  return result;
}

function objectToRow(headers: string[], data: Record<string, unknown>): unknown[] {
  return headers.map((h) => {
    const key = headerToKey(h);
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Unable to parse range')) {
        console.warn(`[GoogleSheets] Aba ${sheetName} não encontrada. Execute: node scripts/init-google-sheet.js`);
        return [];
      }
      console.error(`[GoogleSheets] Erro ao ler ${sheetName}:`, msg);
      throw error;
    }
  },

  async appendRow(sheetName: string, data: Record<string, unknown>): Promise<void> {
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[GoogleSheets] Erro ao adicionar em ${sheetName}:`, msg);
      throw error;
    }
  },

  async updateRow(sheetName: string, id: string, data: Record<string, unknown>): Promise<void> {
    try {
      const sheets = await getSheetsClient();
      const range = sheetNameToRange(sheetName);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range,
      });
      const values = response.data.values || [];
      if (values.length < 2) throw new Error(`Registro ${id} não encontrado em ${sheetName}`);
      const headers = values[0] as string[];
      const idCol = headers.findIndex((h) => h.toLowerCase() === 'id');
      if (idCol === -1) throw new Error(`Coluna ID não encontrada em ${sheetName}`);

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][idCol] || '') === id) {
          const updateRange = `${sheetName}!A${i + 1}`;
          const existingRow = values[i];
          const newRow = headers.map((h, idx) => {
            const key = headerToKey(h);
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
      throw new Error(`Registro ${id} não encontrado em ${sheetName}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[GoogleSheets] Erro ao atualizar ${sheetName}:`, msg);
      throw error;
    }
  },

  async deleteRow(sheetName: string, id: string): Promise<void> {
    try {
      const sheets = await getSheetsClient();
      const sheetId = await getSheetId(sheetName);
      const range = sheetNameToRange(sheetName);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range,
      });
      const values = response.data.values || [];
      if (values.length < 2) throw new Error(`Registro ${id} não encontrado em ${sheetName}`);
      const headers = values[0] as string[];
      const idCol = headers.findIndex((h) => h.toLowerCase() === 'id');
      if (idCol === -1) throw new Error(`Coluna ID não encontrada em ${sheetName}`);

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][idCol] || '') === id) {
          const rowIndex = i + 1;
          const lastCol = colIndexToLetter(headers.length - 1);
          if (rowIndex < values.length) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: getSpreadsheetId(),
              requestBody: {
                requests: [{
                  deleteDimension: {
                    range: {
                      sheetId,
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
              range: `${sheetName}!A${rowIndex}:${lastCol}${rowIndex}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: [headers.map(() => '')] },
            });
          }
          return;
        }
      }
      throw new Error(`Registro ${id} não encontrado em ${sheetName}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[GoogleSheets] Erro ao excluir ${sheetName}:`, msg);
      throw error;
    }
  },

  async findRowById<T>(sheetName: string, id: string): Promise<T | null> {
    const data = await this.getSheetData<T>(sheetName);
    return data.find((item) => String((item as { id?: string }).id) === id) || null;
  },
};
