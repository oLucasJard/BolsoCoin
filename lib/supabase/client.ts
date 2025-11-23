import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

// Tempo de expiração da sessão: 6 horas (em segundos)
const SESSION_EXPIRATION_TIME = 6 * 60 * 60; // 21600 segundos

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'bolsocoin-auth',
        // Definir tempo de expiração da sessão
        flowType: 'pkce',
      },
    }
  );
}

// Função para verificar se a sessão expirou
export async function checkSessionExpiration() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { isExpired: true, session: null };
  }

  // Verificar se a sessão tem mais de 6 horas
  const sessionCreatedAt = new Date(session.user.last_sign_in_at || session.user.created_at).getTime();
  const now = Date.now();
  const sessionAge = (now - sessionCreatedAt) / 1000; // em segundos

  if (sessionAge > SESSION_EXPIRATION_TIME) {
    // Sessão expirada - fazer logout
    await supabase.auth.signOut();
    return { isExpired: true, session: null };
  }

  return { isExpired: false, session };
}

