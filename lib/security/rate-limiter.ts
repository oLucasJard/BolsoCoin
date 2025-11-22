/**
 * Sistema de Rate Limiting Avançado
 * Protege contra abuso e ataques de força bruta
 */

import { LRUCache } from 'lru-cache';

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Cache global para rate limiting
const limiters = new Map<string, LRUCache<string, RateLimitInfo>>();

/**
 * Cria um rate limiter com configurações específicas
 */
export function createRateLimiter(name: string, options: RateLimiterOptions) {
  const { maxRequests, windowMs, keyGenerator = (id) => id } = options;

  // Criar cache se não existir
  if (!limiters.has(name)) {
    limiters.set(
      name,
      new LRUCache<string, RateLimitInfo>({
        max: 5000, // Máximo de 5000 IPs diferentes
        ttl: windowMs,
      })
    );
  }

  const cache = limiters.get(name)!;

  return {
    check: async (identifier: string): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
      retryAfter?: number;
    }> => {
      const key = keyGenerator(identifier);
      const now = Date.now();
      
      let info = cache.get(key);

      // Se não existe ou expirou, criar novo
      if (!info || info.resetTime < now) {
        info = {
          count: 0,
          resetTime: now + windowMs,
          blocked: false,
        };
      }

      // Incrementar contador
      info.count++;

      // Verificar se excedeu limite
      if (info.count > maxRequests) {
        info.blocked = true;
        cache.set(key, info);

        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: info.resetTime,
          retryAfter: Math.ceil((info.resetTime - now) / 1000),
        };
      }

      cache.set(key, info);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - info.count,
        reset: info.resetTime,
      };
    },

    // Resetar limite de um identificador específico
    reset: (identifier: string) => {
      const key = keyGenerator(identifier);
      cache.delete(key);
    },

    // Bloquear permanentemente (até expirar TTL)
    block: (identifier: string) => {
      const key = keyGenerator(identifier);
      const now = Date.now();
      cache.set(key, {
        count: maxRequests + 1,
        resetTime: now + windowMs,
        blocked: true,
      });
    },
  };
}

/**
 * Rate limiters pré-configurados
 */

// Login: 5 tentativas por 15 minutos
export const loginRateLimiter = createRateLimiter('login', {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
});

// API Geral: 100 requisições por minuto
export const apiRateLimiter = createRateLimiter('api', {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minuto
});

// Transcrição: 10 requisições por hora
export const transcriptionRateLimiter = createRateLimiter('transcription', {
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hora
});

// Upload de Imagem: 20 requisições por hora
export const imageUploadRateLimiter = createRateLimiter('image-upload', {
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hora
});

// Criação de Transações: 50 por 5 minutos
export const transactionCreationRateLimiter = createRateLimiter('transaction-creation', {
  maxRequests: 50,
  windowMs: 5 * 60 * 1000, // 5 minutos
});

