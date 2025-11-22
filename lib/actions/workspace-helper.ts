'use server';

import { createClient } from '@/lib/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';

/**
 * Verificação simplificada de acesso ao workspace
 * EVITA consultar workspace_members para prevenir recursão infinita no RLS
 * 
 * Por enquanto, verifica apenas se o usuário é OWNER do workspace
 * Futuramente, quando o RLS estiver estável, podemos adicionar suporte a membros
 */
export async function verifyWorkspaceAccess(
  workspaceId: string,
  userId: string,
  supabase?: SupabaseClient
): Promise<boolean> {
  const client = supabase || await createClient();

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    return false;
  }

  // Buscar workspace e verificar se usuário é owner
  const { data, error } = await client
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (error || !data) {
    return false;
  }

  // Retorna true se for owner
  return data.owner_id === userId;
}

