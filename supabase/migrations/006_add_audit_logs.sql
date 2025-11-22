-- ============================================================================
-- BolsoCoin v2.0 - Audit Logs & Security
-- Migration: 006_add_audit_logs.sql
-- Objetivo: Sistema de auditoria e logs de segurança
-- ============================================================================

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'read', 'login', 'logout'
  resource_type TEXT NOT NULL, -- 'transaction', 'workspace', 'budget', 'goal'
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'error', 'blocked'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT action_valid CHECK (action IN ('create', 'update', 'delete', 'read', 'login', 'logout', 'api_call'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_status_idx ON public.audit_logs(status);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Apenas admins podem ver todos os logs (future feature)
-- Por enquanto, usuários veem apenas seus próprios logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT 
  USING (user_id = auth.uid());

-- Apenas sistema pode inserir (via service role ou trigger)
-- Usuários não podem inserir diretamente

-- Tabela de tentativas de login falhadas
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason TEXT -- 'invalid_password', 'user_not_found', 'account_locked'
);

-- Índices
CREATE INDEX IF NOT EXISTS failed_login_attempts_email_idx ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS failed_login_attempts_ip_idx ON public.failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS failed_login_attempts_attempted_at_idx ON public.failed_login_attempts(attempted_at DESC);

-- Habilitar RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Ninguém pode acessar diretamente (apenas admin via service role)
CREATE POLICY "No direct access to failed login attempts" ON public.failed_login_attempts
  FOR SELECT 
  USING (false);

-- Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar tentativa de login falhada
CREATE OR REPLACE FUNCTION public.log_failed_login(
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO public.failed_login_attempts (
    email,
    ip_address,
    user_agent,
    reason
  ) VALUES (
    p_email,
    p_ip_address,
    p_user_agent,
    p_reason
  )
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se IP está bloqueado (muitas tentativas falhadas)
CREATE OR REPLACE FUNCTION public.is_ip_blocked(
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempt_count INTEGER;
BEGIN
  -- Contar tentativas nos últimos X minutos
  SELECT COUNT(*) INTO v_attempt_count
  FROM public.failed_login_attempts
  WHERE ip_address = p_ip_address
    AND attempted_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar logs antigos (manter apenas 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar logs de auditoria com mais de 90 dias
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Deletar tentativas de login falhadas com mais de 30 dias
  DELETE FROM public.failed_login_attempts
  WHERE attempted_at < NOW() - INTERVAL '30 days';
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para estatísticas de segurança
CREATE OR REPLACE VIEW public.security_stats AS
SELECT
  DATE(attempted_at) as date,
  COUNT(*) as failed_attempts,
  COUNT(DISTINCT email) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM public.failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(attempted_at)
ORDER BY date DESC;

-- Comentários
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria de todas as ações no sistema';
COMMENT ON TABLE public.failed_login_attempts IS 'Registro de tentativas de login falhadas para segurança';
COMMENT ON FUNCTION public.log_audit IS 'Registra ação de auditoria';
COMMENT ON FUNCTION public.log_failed_login IS 'Registra tentativa de login falhada';
COMMENT ON FUNCTION public.is_ip_blocked IS 'Verifica se IP está bloqueado por muitas tentativas';
COMMENT ON FUNCTION public.cleanup_old_logs IS 'Remove logs antigos (rodar via cron)';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 006_add_audit_logs.sql executada com sucesso!';
  RAISE NOTICE '📊 Tabelas de auditoria criadas';
  RAISE NOTICE '🔒 RLS configurado';
  RAISE NOTICE '⚡ Funções de segurança criadas';
  RAISE NOTICE '📈 View de estatísticas criada';
END $$;

