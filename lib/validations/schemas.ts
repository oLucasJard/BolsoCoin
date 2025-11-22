import { z } from 'zod';

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const createTransactionSchema = z.object({
  amount: z.number().positive('O valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo deve ser "income" ou "expense"' }),
  }),
  categoryName: z.string().min(1).max(100).optional(),
  vendor: z.string().max(255).optional(),
  date: z.date().optional(),
  imageUrl: z.string().url().optional(),
  rawInput: z.string().max(1000).optional(),
  source: z.string().max(50).optional(),
  workspaceId: z.string().uuid('ID do workspace inválido'),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(255).optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryName: z.string().min(1).max(100).optional(),
  vendor: z.string().max(255).optional(),
  date: z.date().optional(),
});

export const transactionFiltersSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryName: z.string().optional(),
});

// ============================================================================
// WORKSPACE SCHEMAS
// ============================================================================

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use hex, ex: #FFD100)').optional(),
  type: z.enum(['personal', 'business', 'church', 'project'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
  type: z.enum(['personal', 'business', 'church', 'project']).optional(),
});

// ============================================================================
// BUDGET SCHEMAS
// ============================================================================

export const createBudgetSchema = z.object({
  categoryName: z.string().min(1, 'Nome da categoria é obrigatório').max(100),
  amount: z.number().positive('O valor deve ser positivo'),
  month: z.number().int().min(1).max(12, 'Mês deve estar entre 1 e 12'),
  year: z.number().int().min(2000).max(2100, 'Ano inválido'),
  workspaceId: z.string().uuid('ID do workspace inválido'),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('O valor deve ser positivo'),
});

// ============================================================================
// GOAL SCHEMAS
// ============================================================================

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255),
  description: z.string().max(1000).optional(),
  targetAmount: z.number().positive('O valor da meta deve ser positivo'),
  deadline: z.date().optional(),
  workspaceId: z.string().uuid('ID do workspace inválido'),
});

export const updateGoalProgressSchema = z.object({
  currentAmount: z.number().min(0, 'O valor atual não pode ser negativo'),
});

// ============================================================================
// HELPER TYPE EXPORTS
// ============================================================================

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

