export type Transacao = {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string;
  fornecedor: string;
  data: string;
  forma_pagamento: string;
  observacao: string;
  status: string;
};

export type CartaoCredito = {
  id: string;
  bandeira: string;
  nome: string;
  limite_total: number;
  limite_utilizado: number;
  data_fechamento: number;
  data_vencimento: number;
  cor: string;
};

export type FaturaCartao = {
  id: string;
  cartao_id: string;
  mes: number;
  ano: number;
  valor_total: number;
  valor_pago: number;
  status: string;
  data_vencimento: string;
};

export type CobrancaRecorrente = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  fornecedor: string;
  dia_vencimento: number;
  tipo_recorrencia: string;
  ativo: boolean | string;
  ultimo_pagamento: string;
};

export type Investimento = {
  id: string;
  nome: string;
  tipo: string;
  valor_aplicado: number;
  valor_atual: number;
  data_aplicacao: string;
  instituicao: string;
  rentabilidade: string;
};

export type Reserva = {
  id: string;
  nome: string;
  valor_meta: number;
  valor_atual: number;
  data_criacao: string;
  prioridade: string;
};

export type Orcamento = {
  id: string;
  categoria: string;
  valor_limite: number;
  mes: number;
  ano: number;
};

export type MetaFinanceira = {
  id: string;
  titulo: string;
  descricao: string;
  valor_alvo: number;
  valor_atual: number;
  prazo: string;
  status: string;
};

export type CategoriaConfig = {
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  icone: string;
};

export interface SheetBackend {
  getSheetData<T>(sheetName: string): Promise<T[]>;
  appendRow(sheetName: string, data: Record<string, any>): Promise<void>;
  updateRow(sheetName: string, id: string, data: Record<string, any>): Promise<void>;
  deleteRow(sheetName: string, id: string): Promise<void>;
  findRowById<T>(sheetName: string, id: string): Promise<T | null>;
}
