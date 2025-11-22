-- ============================================================================
-- BolsoCoin v2.0 - API Usage Tracking
-- Migration: 005_add_api_usage_tracking.sql
-- Objetivo: Rastrear uso da API do ChatGPT com limite diário
-- ============================================================================

-- Criar tabela para rastrear uso da API
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  api_type TEXT NOT NULL, -- 'chatgpt', 'whisper', etc
  endpoint TEXT NOT NULL, -- '/api/process-text', '/api/transcribe', etc
  tokens_used INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 4) DEFAULT 0.00,
  request_data JSONB DEFAULT '{}'::jsonb,
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL, -- Para facilitar queries diárias
  
  -- Constraints
  CONSTRAINT api_type_valid CHECK (api_type IN ('chatgpt', 'whisper', 'dalle', 'embedding'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS api_usage_user_id_idx ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS api_usage_date_idx ON public.api_usage(date DESC);
CREATE INDEX IF NOT EXISTS api_usage_user_date_idx ON public.api_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS api_usage_api_type_idx ON public.api_usage(api_type);

-- Habilitar RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own api usage" ON public.api_usage
  FOR SELECT 
  USING (user_id = auth.uid());

-- Apenas o sistema pode inserir (via service role)
-- Usuários não podem inserir diretamente

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
  
  -- Calcular quando reseta (meia-noite de hoje)
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
COMMENT ON TABLE public.api_usage IS 'Rastreamento de uso da API para rate limiting e analytics';
COMMENT ON FUNCTION public.check_daily_api_limit IS 'Verifica se usuário pode usar a API (limite diário)';
COMMENT ON FUNCTION public.log_api_usage IS 'Registra uso da API';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 005_add_api_usage_tracking.sql executada com sucesso!';
  RAISE NOTICE '📊 Tabela api_usage criada';
  RAISE NOTICE '🔒 RLS configurado';
  RAISE NOTICE '⚡ Funções de rate limiting criadas';
  RAISE NOTICE '📈 View de estatísticas criada';
END $$;

