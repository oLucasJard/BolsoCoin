'use server';

import { createClient } from '@/lib/supabase/server';
import { extractTransactionFromText, extractTransactionFromImage } from '@/lib/openai';
import { revalidatePath } from 'next/cache';
import { 
  createTransactionSchema, 
  updateTransactionSchema, 
  transactionFiltersSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput
} from '@/lib/validations/schemas';

export async function createTransaction(data: CreateTransactionInput) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar dados com Zod
  const validatedData = createTransactionSchema.parse(data);

  // Verificar se o usuário tem acesso ao workspace (simplificado - evita recursão)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', validatedData.workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    throw new Error('Você não tem acesso a este workspace');
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      workspace_id: validatedData.workspaceId,
      amount: validatedData.amount,
      description: validatedData.description,
      type: validatedData.type,
      category_name: validatedData.categoryName || 'Outros',
      vendor: validatedData.vendor,
      date: validatedData.date ? validatedData.date.toISOString() : new Date().toISOString(),
      image_url: validatedData.imageUrl,
      raw_input: validatedData.rawInput,
      source: validatedData.source || 'web',
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/transacoes');

  return transaction;
}

export async function getTransactions(
  workspaceId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: 'income' | 'expense';
    categoryName?: string;
  }
) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

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

  // Validar filtros (se fornecidos)
  if (filters) {
    transactionFiltersSchema.parse(filters);
  }

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate.toISOString());
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate.toISOString());
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.categoryName) {
    query = query.eq('category_name', filters.categoryName);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID da transação inválido');
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/transacoes');
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput
) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar ID
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('ID da transação inválido');
  }

  // Validar dados com Zod
  const validatedData = updateTransactionSchema.parse(data);

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
  if (validatedData.description) updateData.description = validatedData.description;
  if (validatedData.type) updateData.type = validatedData.type;
  if (validatedData.categoryName) updateData.category_name = validatedData.categoryName;
  if (validatedData.vendor) updateData.vendor = validatedData.vendor;
  if (validatedData.date) updateData.date = validatedData.date.toISOString();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/transacoes');

  return transaction;
}

export async function processTextInput(text: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const extracted = await extractTransactionFromText(text);

  return {
    amount: parseFloat(extracted.amount),
    type: extracted.type as 'income' | 'expense',
    description: extracted.description,
    categoryName: extracted.category,
    vendor: extracted.vendor,
    date: extracted.date ? new Date(extracted.date) : new Date(),
    rawInput: text,
  };
}

export async function processImageInput(imageBase64: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const extracted = await extractTransactionFromImage(imageBase64);

  return {
    amount: parseFloat(extracted.amount),
    type: 'expense' as const,
    description: extracted.description,
    categoryName: extracted.category,
    vendor: extracted.vendor,
    date: extracted.date ? new Date(extracted.date) : new Date(),
  };
}

export async function getDashboardStats(workspaceId: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Buscar transações do mês
  const { data: monthTransactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .gte('date', startOfMonth.toISOString())
    .lte('date', endOfMonth.toISOString());

  if (error) throw error;

  const transactions = monthTransactions || [];

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Top categorias
  const categoryStats = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category_name || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Últimas transações (filtradas por workspace)
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    balance,
    totalIncome,
    totalExpense,
    topCategories,
    recentTransactions: recentTransactions || [],
  };
}
