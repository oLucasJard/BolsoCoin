'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/supabase/client';

/**
 * Componente para validar a sessão do usuário periodicamente
 * Verifica a cada 5 minutos se a sessão ainda é válida
 * Se a sessão tiver mais de 6 horas, força o logout
 */
export function SessionValidator() {
  const router = useRouter();

  useEffect(() => {
    // Verificar imediatamente ao montar
    const validateSession = async () => {
      const { isExpired } = await checkSessionExpiration();
      
      if (isExpired) {
        // Sessão expirada - redirecionar para login
        router.push('/login?session=expired');
      }
    };

    // Verificar imediatamente
    validateSession();

    // Verificar a cada 5 minutos
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    // Verificar ao retomar a aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return null;
}

