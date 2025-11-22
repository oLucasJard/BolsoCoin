'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  createBudgetSchema, 
  updateBudgetSchema, 
  createGoalSchema, 
  updateGoalProgressSchema,
  type CreateBudgetInput,
  type CreateGoalInput
} from '@/lib/validations/schemas';

export async function createBudget(data: CreateBudgetInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar dados com Zod
  const validatedData = createBudgetSchema.parse(data);

  // Verificar acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', validatedData.workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      workspace_id: validatedData.workspaceId,
      category_name: validatedData.categoryName,
      amount: validatedData.amount,
      month: validatedData.month,
      year: validatedData.year,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/orcamentos');
  return budget;
}

export async function getBudgets(workspaceId: string, month?: number, year?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Verificar acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .eq('month', targetMonth)
    .eq('year', targetYear);

  if (error) throw error;
  return data || [];
}

export async function updateBudget(id: string, data: { amount: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID do orçamento inválido');
  }

  // Validar dados com Zod
  const validatedData = updateBudgetSchema.parse(data);

  const { error } = await supabase
    .from('budgets')
    .update({ amount: validatedData.amount, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/orcamentos');
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID do orçamento inválido');
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/orcamentos');
}

export async function createGoal(data: CreateGoalInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar dados com Zod
  const validatedData = createGoalSchema.parse(data);

  // Verificar acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', validatedData.workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      workspace_id: validatedData.workspaceId,
      title: validatedData.title,
      description: validatedData.description,
      target_amount: validatedData.targetAmount,
      deadline: validatedData.deadline?.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/orcamentos');
  return goal;
}

export async function getGoals(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Verificar acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateGoalProgress(id: string, currentAmount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID da meta inválido');
  }

  // Validar dados com Zod
  const validatedData = updateGoalProgressSchema.parse({ currentAmount });

  // Buscar a meta para verificar se foi completada
  const { data: goal } = await supabase
    .from('goals')
    .select('target_amount')
    .eq('id', id)
    .single();

  const status = goal && validatedData.currentAmount >= goal.target_amount ? 'completed' : 'active';

  const { error } = await supabase
    .from('goals')
    .update({ 
      current_amount: validatedData.currentAmount, 
      status,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/orcamentos');
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID da meta inválido');
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/orcamentos');
}

export async function getBudgetComparison(workspaceId: string, month?: number, year?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Verificar acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  // Buscar orçamentos
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .eq('month', targetMonth)
    .eq('year', targetYear);

  // Buscar gastos reais
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .eq('type', 'expense')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  // Agrupar gastos por categoria
  const spentByCategory: Record<string, number> = {};
  transactions?.forEach((t) => {
    const cat = t.category_name || 'Outros';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(t.amount);
  });

  // Comparar
  const comparison = budgets?.map((b) => ({
    category: b.category_name,
    budget: Number(b.amount),
    spent: spentByCategory[b.category_name] || 0,
    remaining: Number(b.amount) - (spentByCategory[b.category_name] || 0),
    percentage: ((spentByCategory[b.category_name] || 0) / Number(b.amount)) * 100,
  })) || [];

  return comparison;
}

