'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { extractTransactionFromText, extractTransactionFromImage } from '@/lib/openai';

export async function createTransaction(data: {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  categoryName?: string;
  vendor?: string;
  date?: Date;
  imageUrl?: string;
  rawInput?: string;
  source?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const [transaction] = await db.insert(transactions).values({
    userId,
    amount: data.amount.toString(),
    description: data.description,
    type: data.type,
    categoryName: data.categoryName || 'Outros',
    vendor: data.vendor,
    date: data.date || new Date(),
    imageUrl: data.imageUrl,
    rawInput: data.rawInput,
    source: data.source || 'web',
  }).returning();

  return transaction;
}

export async function getTransactions(filters?: {
  startDate?: Date;
  endDate?: Date;
  type?: 'income' | 'expense';
  categoryName?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const conditions = [eq(transactions.userId, userId)];

  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters?.categoryName) {
    conditions.push(eq(transactions.categoryName, filters.categoryName));
  }

  const result = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit: 100,
  });

  return result;
}

export async function deleteTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function updateTransaction(id: string, data: {
  amount?: number;
  description?: string;
  type?: 'income' | 'expense';
  categoryName?: string;
  vendor?: string;
  date?: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const updateData: any = { updatedAt: new Date() };
  if (data.amount !== undefined) updateData.amount = data.amount.toString();
  if (data.description) updateData.description = data.description;
  if (data.type) updateData.type = data.type;
  if (data.categoryName) updateData.categoryName = data.categoryName;
  if (data.vendor) updateData.vendor = data.vendor;
  if (data.date) updateData.date = data.date;

  const [transaction] = await db.update(transactions)
    .set(updateData)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();

  return transaction;
}

export async function processTextInput(text: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

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
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

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

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Total de receitas e despesas do mês
  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, userId),
      gte(transactions.date, startOfMonth),
      lte(transactions.date, endOfMonth)
    ),
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Top categorias
  const categoryStats = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.categoryName || 'Outros';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Últimas transações
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.createdAt)],
    limit: 5,
  });

  return {
    balance,
    totalIncome,
    totalExpense,
    topCategories,
    recentTransactions,
  };
}

