'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUser() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

export async function updateUserCurrency(currency: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ currency, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
}

export async function getUserProfile() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return profile;
}

export async function updateUserProfile(data: {
  name?: string;
  telegram_chat_id?: string;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
}
