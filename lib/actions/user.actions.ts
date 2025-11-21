'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Usuário não encontrado');

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      currency: 'BRL',
    });
  }

  return existingUser || { id: userId };
}

export async function updateUserCurrency(currency: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  await db.update(users)
    .set({ currency, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autenticado');

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user;
}

