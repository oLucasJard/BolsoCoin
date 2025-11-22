/**
 * Rate Limiting Simples usando Map em memória
 * 
 * NOTA: Em produção, considere usar Redis (Upstash) ou Vercel KV para rate limiting distribuído
 * Esta implementação funciona bem para single-instance, mas não é ideal para múltiplos servidores
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpar entradas antigas a cada 1 minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export type RateLimitConfig = {
  /**
   * Número máximo de requisições permitidas
   */
  maxRequests: number;
  
  /**
   * Janela de tempo em milissegundos
   */
  windowMs: number;
};

/**
 * Verifica se a requisição deve ser permitida
 * @param identifier Identificador único (ex: user_id, IP)
 * @param config Configuração do rate limit
 * @returns true se a requisição for permitida, false caso contrário
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minuto
  }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const resetTime = now + config.windowMs;

  const entry = rateLimitStore.get(identifier);

  // Se não existe ou expirou, criar nova entrada
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Se ainda não atingiu o limite
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Limite atingido
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
  };
}

/**
 * Configurações pré-definidas de rate limit
 */
export const RateLimitPresets = {
  /**
   * 10 requisições por minuto - Para operações de escrita
   */
  STRICT: { maxRequests: 10, windowMs: 60000 },
  
  /**
   * 30 requisições por minuto - Para operações moderadas
   */
  MODERATE: { maxRequests: 30, windowMs: 60000 },
  
  /**
   * 100 requisições por minuto - Para leitura geral
   */
  STANDARD: { maxRequests: 100, windowMs: 60000 },
  
  /**
   * 5 requisições por hora - Para operações sensíveis (OpenAI)
   */
  OPENAI: { maxRequests: 5, windowMs: 3600000 },
};

/**
 * Middleware helper para rate limiting em route handlers
 */
export function withRateLimit(
  identifier: string,
  config?: RateLimitConfig
): { allowed: boolean; headers: Record<string, string> } {
  const result = checkRateLimit(identifier, config);
  
  return {
    allowed: result.allowed,
    headers: {
      'X-RateLimit-Limit': config?.maxRequests.toString() || '100',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    },
  };
}

