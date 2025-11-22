/**
 * Sistema de Auditoria e Logs de Segurança
 * Registra todas as ações importantes do sistema
 */

import { createClient } from '@/lib/supabase/server';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'read' 
  | 'login' 
  | 'logout' 
  | 'api_call';

export type ResourceType = 
  | 'transaction' 
  | 'workspace' 
  | 'budget' 
  | 'goal' 
  | 'user';

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'error' | 'blocked';
  errorMessage?: string;
}

/**
 * Registra log de auditoria
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc('log_audit', {
      p_user_id: data.userId || null,
      p_action: data.action,
      p_resource_type: data.resourceType,
      p_resource_id: data.resourceId || null,
      p_old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      p_new_values: data.newValues ? JSON.stringify(data.newValues) : null,
      p_ip_address: data.ipAddress || null,
      p_user_agent: data.userAgent || null,
      p_status: data.status || 'success',
      p_error_message: data.errorMessage || null,
    });
  } catch (error) {
    // Não bloquear a aplicação se falhar o log
    console.error('[AUDIT] Erro ao registrar log:', error);
  }
}

/**
 * Registra tentativa de login falhada
 */
export async function logFailedLogin(
  email: string,
  ipAddress: string,
  userAgent?: string,
  reason?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc('log_failed_login', {
      p_email: email,
      p_ip_address: ipAddress,
      p_user_agent: userAgent || null,
      p_reason: reason || null,
    });
  } catch (error) {
    console.error('[SECURITY] Erro ao registrar login falhado:', error);
  }
}

/**
 * Verifica se IP está bloqueado por tentativas falhadas
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('is_ip_blocked', {
      p_ip_address: ipAddress,
      p_max_attempts: 5,
      p_window_minutes: 15,
    });

    if (error) throw error;

    return data as boolean;
  } catch (error) {
    console.error('[SECURITY] Erro ao verificar IP bloqueado:', error);
    // Em caso de erro, não bloqueia (fail open)
    return false;
  }
}

/**
 * Helper para extrair IP do request
 */
export function getIPFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Helper para extrair User-Agent do request
 */
export function getUserAgentFromRequest(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Limpa logs antigos (para executar via cron)
 */
export async function cleanupOldLogs(): Promise<number> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('cleanup_old_logs');

    if (error) throw error;

    return data as number;
  } catch (error) {
    console.error('[AUDIT] Erro ao limpar logs antigos:', error);
    return 0;
  }
}

/**
 * Busca logs de auditoria do usuário
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[AUDIT] Erro ao buscar logs:', error);
    return [];
  }
}

