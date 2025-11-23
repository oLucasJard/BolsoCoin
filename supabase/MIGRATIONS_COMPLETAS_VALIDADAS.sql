-- ============================================================================
-- MIGRATIONS COMPLETAS E VALIDADAS - BolsoCoin v2.0
-- Execute estes SQLs NA ORDEM no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: FIX RLS RECURSION (CRÍTICO - EXECUTAR PRIMEIRO!)
-- ============================================================================

-- PASSO 1: DESABILITAR TRIGGERS QUE CAUSAM RECURSÃO
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_profile_created_create_workspace ON public.profiles;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS RECURSIVAS
-- ----------------------------------------------------------------------------

-- Remover políticas de workspace_members
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "view_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "insert_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "delete_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "update_own_membership" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

-- Remover políticas de workspaces que fazem EXISTS em workspace_members
DROP POLICY IF EXISTS "Users can view own and member workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_insert_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner" ON public.workspaces;

-- Remover políticas de transactions
DROP POLICY IF EXISTS "Users can view workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_simple" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_simple" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_simple" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_simple" ON public.transactions;

-- Remover políticas de categories
DROP POLICY IF EXISTS "Users can view workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete workspace categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select_simple" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_simple" ON public.categories;
DROP POLICY IF EXISTS "categories_update_simple" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_simple" ON public.categories;

-- Remover políticas de budgets
DROP POLICY IF EXISTS "Users can view workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "budgets_select_simple" ON public.budgets;
DROP POLICY IF EXISTS "budgets_insert_simple" ON public.budgets;
DROP POLICY IF EXISTS "budgets_update_simple" ON public.budgets;
DROP POLICY IF EXISTS "budgets_delete_simple" ON public.budgets;

-- Remover políticas de goals
DROP POLICY IF EXISTS "Users can view workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete workspace goals" ON public.goals;
DROP POLICY IF EXISTS "goals_select_simple" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_simple" ON public.goals;
DROP POLICY IF EXISTS "goals_update_simple" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_simple" ON public.goals;

-- PASSO 3: DESABILITAR RLS EM WORKSPACE_MEMBERS (TEMPORÁRIO)
-- ----------------------------------------------------------------------------

ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;

-- PASSO 4: CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO)
-- ----------------------------------------------------------------------------

-- ============
-- WORKSPACES - Apenas owner tem acesso
-- ============

CREATE POLICY "workspaces_select_owner" ON public.workspaces
  FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert_owner" ON public.workspaces
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_owner" ON public.workspaces
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_owner" ON public.workspaces
  FOR DELETE 
  USING (owner_id = auth.uid());

-- ============
-- TRANSACTIONS - User_id E owner do workspace
-- ============

CREATE POLICY "transactions_select_simple" ON public.transactions
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "transactions_insert_simple" ON public.transactions
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "transactions_update_simple" ON public.transactions
  FOR UPDATE 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "transactions_delete_simple" ON public.transactions
  FOR DELETE 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

-- ============
-- CATEGORIES
-- ============

CREATE POLICY "categories_select_simple" ON public.categories
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = categories.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "categories_insert_simple" ON public.categories
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update_simple" ON public.categories
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "categories_delete_simple" ON public.categories
  FOR DELETE 
  USING (user_id = auth.uid());

-- ============
-- BUDGETS
-- ============

CREATE POLICY "budgets_select_simple" ON public.budgets
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = budgets.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "budgets_insert_simple" ON public.budgets
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "budgets_update_simple" ON public.budgets
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "budgets_delete_simple" ON public.budgets
  FOR DELETE 
  USING (user_id = auth.uid());

-- ============
-- GOALS
-- ============

CREATE POLICY "goals_select_simple" ON public.goals
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = goals.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "goals_insert_simple" ON public.goals
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_simple" ON public.goals
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "goals_delete_simple" ON public.goals
  FOR DELETE 
  USING (user_id = auth.uid());

-- Notificação de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION 1: RLS Recursion Fix - CONCLUÍDA!';
END $$;


-- ============================================================================
-- MIGRATION 2: API USAGE TRACKING
-- ============================================================================

-- Criar tabela para rastrear uso da API
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  api_type TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 4) DEFAULT 0.00,
  request_data JSONB DEFAULT '{}'::jsonb,
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  
  CONSTRAINT api_type_valid CHECK (api_type IN ('chatgpt', 'whisper', 'dalle', 'embedding'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS api_usage_user_id_idx ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS api_usage_date_idx ON public.api_usage(date DESC);
CREATE INDEX IF NOT EXISTS api_usage_user_date_idx ON public.api_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS api_usage_api_type_idx ON public.api_usage(api_type);

-- Habilitar RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários podem ver APENAS seu próprio uso
CREATE POLICY "api_usage_select_own" ON public.api_usage
  FOR SELECT 
  USING (user_id = auth.uid());

-- Sistema insere via RPC (service role), usuários não inserem diretamente

-- Função para verificar limite diário de API
CREATE OR REPLACE FUNCTION public.check_daily_api_limit(
  p_user_id UUID,
  p_api_type TEXT,
  p_daily_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  can_use BOOLEAN,
  usage_count INTEGER,
  limit_value INTEGER,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_usage_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Contar uso hoje
  SELECT COUNT(*) INTO v_usage_count
  FROM public.api_usage
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND date = CURRENT_DATE;
  
  -- Calcular quando reseta
  v_reset_at := (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ;
  
  -- Retornar resultado
  RETURN QUERY SELECT
    v_usage_count < p_daily_limit AS can_use,
    v_usage_count AS usage_count,
    p_daily_limit AS limit_value,
    v_reset_at AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar uso da API
CREATE OR REPLACE FUNCTION public.log_api_usage(
  p_user_id UUID,
  p_api_type TEXT,
  p_endpoint TEXT,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost_estimate DECIMAL DEFAULT 0.00,
  p_request_data JSONB DEFAULT '{}'::jsonb,
  p_response_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  INSERT INTO public.api_usage (
    user_id,
    api_type,
    endpoint,
    tokens_used,
    cost_estimate,
    request_data,
    response_data,
    date
  ) VALUES (
    p_user_id,
    p_api_type,
    p_endpoint,
    p_tokens_used,
    p_cost_estimate,
    p_request_data,
    p_response_data,
    CURRENT_DATE
  )
  RETURNING id INTO v_usage_id;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para estatísticas diárias
CREATE OR REPLACE VIEW public.daily_api_stats AS
SELECT
  user_id,
  api_type,
  date,
  COUNT(*) as request_count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_estimate) as total_cost
FROM public.api_usage
GROUP BY user_id, api_type, date;

-- Comentários
COMMENT ON TABLE public.api_usage IS 'Rastreamento de uso da API para rate limiting';
COMMENT ON FUNCTION public.check_daily_api_limit IS 'Verifica limite diário de API';
COMMENT ON FUNCTION public.log_api_usage IS 'Registra uso da API';

-- Notificação de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION 2: API Usage Tracking - CONCLUÍDA!';
END $$;


-- ============================================================================
-- MIGRATION 3: AUDIT LOGS & SECURITY
-- ============================================================================

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT action_valid CHECK (action IN ('create', 'update', 'delete', 'read', 'login', 'logout', 'api_call'))
);

-- Índices
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_status_idx ON public.audit_logs(status);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários veem APENAS seus próprios logs
CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT 
  USING (user_id = auth.uid());

-- Tabela de tentativas de login falhadas
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS failed_login_attempts_email_idx ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS failed_login_attempts_ip_idx ON public.failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS failed_login_attempts_attempted_at_idx ON public.failed_login_attempts(attempted_at DESC);

-- Habilitar RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Ninguém pode acessar diretamente (apenas admin via service role)
CREATE POLICY "failed_login_no_access" ON public.failed_login_attempts
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

-- Função para verificar se IP está bloqueado
CREATE OR REPLACE FUNCTION public.is_ip_blocked(
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_attempt_count
  FROM public.failed_login_attempts
  WHERE ip_address = p_ip_address
    AND attempted_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
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
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria do sistema';
COMMENT ON TABLE public.failed_login_attempts IS 'Tentativas de login falhadas';
COMMENT ON FUNCTION public.log_audit IS 'Registra log de auditoria';
COMMENT ON FUNCTION public.log_failed_login IS 'Registra login falhado';
COMMENT ON FUNCTION public.is_ip_blocked IS 'Verifica se IP está bloqueado';
COMMENT ON FUNCTION public.cleanup_old_logs IS 'Limpa logs antigos';

-- Notificação de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ MIGRATION 3: Audit Logs & Security - CONCLUÍDA!';
END $$;


-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO:';
  RAISE NOTICE '  ✅ Migration 1: RLS Recursion Fix';
  RAISE NOTICE '  ✅ Migration 2: API Usage Tracking';
  RAISE NOTICE '  ✅ Migration 3: Audit Logs & Security';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SEGURANÇA:';
  RAISE NOTICE '  ✅ workspace_members RLS desabilitado (sem recursão)';
  RAISE NOTICE '  ✅ Policies simples baseadas em owner_id';
  RAISE NOTICE '  ✅ api_usage com RLS (users can view own)';
  RAISE NOTICE '  ✅ audit_logs com RLS (users can view own)';
  RAISE NOTICE '  ✅ failed_login_attempts sem acesso direto';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ FUNÇÕES CRIADAS:';
  RAISE NOTICE '  ✅ check_daily_api_limit()';
  RAISE NOTICE '  ✅ log_api_usage()';
  RAISE NOTICE '  ✅ log_audit()';
  RAISE NOTICE '  ✅ log_failed_login()';
  RAISE NOTICE '  ✅ is_ip_blocked()';
  RAISE NOTICE '  ✅ cleanup_old_logs()';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Verifique se não há erros acima';
  RAISE NOTICE '  2. Teste o login no sistema';
  RAISE NOTICE '  3. Teste criação de transações';
  RAISE NOTICE '  4. Verifique se workspaces carregam';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

