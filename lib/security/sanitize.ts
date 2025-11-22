/**
 * Funções de sanitização e validação de inputs
 * Protege contra XSS, SQL Injection e outros ataques
 */

/**
 * Sanitiza string removendo HTML e scripts
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc)
    .substring(0, 1000); // Limita tamanho
}

/**
 * Sanitiza HTML permitindo apenas tags seguras
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br'];
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

  return html.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Limitar tamanho
  if (sanitized.length > 255) {
    return null;
  }

  return sanitized;
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitiza número (valor monetário)
 */
export function sanitizeAmount(amount: any): number | null {
  const num = parseFloat(amount);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  // Limitar valores extremos
  if (num < 0 || num > 999999999.99) {
    return null;
  }

  // Arredondar para 2 casas decimais
  return Math.round(num * 100) / 100;
}

/**
 * Sanitiza data
 */
export function sanitizeDate(date: any): Date | null {
  if (!date) return null;

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return null;
  }

  // Não permitir datas muito antigas ou futuras
  const minDate = new Date('2000-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);

  if (parsed < minDate || parsed > maxDate) {
    return null;
  }

  return parsed;
}

/**
 * Remove caracteres SQL perigosos (extra proteção, Supabase já protege)
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';

  return input
    .replace(/['";]/g, '') // Remove aspas e ponto e vírgula
    .replace(/--/g, '') // Remove comentários SQL
    .replace(/\/\*/g, '') // Remove início de comentário de bloco
    .replace(/\*\//g, '') // Remove fim de comentário de bloco
    .replace(/xp_/gi, '') // Remove comandos SQL Server perigosos
    .replace(/exec\s/gi, '') // Remove EXEC
    .replace(/execute\s/gi, '') // Remove EXECUTE
    .replace(/drop\s/gi, '') // Remove DROP
    .replace(/delete\s/gi, '') // Remove DELETE
    .replace(/truncate\s/gi, ''); // Remove TRUNCATE
}

/**
 * Valida tipo de transação
 */
export function isValidTransactionType(type: string): type is 'income' | 'expense' {
  return type === 'income' || type === 'expense';
}

/**
 * Valida workspace type
 */
export function isValidWorkspaceType(type: string): type is 'personal' | 'business' | 'church' | 'project' {
  return ['personal', 'business', 'church', 'project'].includes(type);
}

/**
 * Sanitiza filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'file';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais
    .replace(/\.{2,}/g, '.') // Remove múltiplos pontos
    .substring(0, 255); // Limita tamanho
}

/**
 * Valida base64
 */
export function isValidBase64(str: string): boolean {
  if (!str) return false;
  
  try {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str);
  } catch {
    return false;
  }
}

/**
 * Objeto com todas as funções de sanitização
 */
export const sanitize = {
  string: sanitizeString,
  html: sanitizeHTML,
  email: sanitizeEmail,
  amount: sanitizeAmount,
  date: sanitizeDate,
  sql: sanitizeSQL,
  filename: sanitizeFilename,
};

/**
 * Objeto com todas as funções de validação
 */
export const validate = {
  uuid: isValidUUID,
  transactionType: isValidTransactionType,
  workspaceType: isValidWorkspaceType,
  base64: isValidBase64,
};

