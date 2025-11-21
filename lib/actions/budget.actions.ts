'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBudget(data: {
  categoryName: string;
  amount: number;
  month: number;
  year: number;
  workspaceId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      workspace_id: data.workspaceId,
      category_name: data.categoryName,
      amount: data.amount,
      month: data.month,
      year: data.year,
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

  const { error } = await supabase
    .from('budgets')
    .update({ amount: data.amount, updated_at: new Date().toISOString() })
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

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/orcamentos');
}

export async function createGoal(data: {
  title: string;
  description?: string;
  targetAmount: number;
  deadline?: Date;
  workspaceId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Não autenticado');

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      workspace_id: data.workspaceId,
      title: data.title,
      description: data.description,
      target_amount: data.targetAmount,
      deadline: data.deadline?.toISOString(),
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

  // Buscar a meta para verificar se foi completada
  const { data: goal } = await supabase
    .from('goals')
    .select('target_amount')
    .eq('id', id)
    .single();

  const status = goal && currentAmount >= goal.target_amount ? 'completed' : 'active';

  const { error } = await supabase
    .from('goals')
    .update({ 
      current_amount: currentAmount, 
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

