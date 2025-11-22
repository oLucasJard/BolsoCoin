import { createClient } from '@/lib/supabase/server';

export type ApiLimitResult = {
  canUse: boolean;
  usageCount: number;
  limitValue: number;
  resetAt: Date;
  message?: string;
};

/**
 * Verifica se o usuário pode usar a API do ChatGPT
 * Limite padrão: 5 chamadas por dia
 */
export async function checkChatGPTLimit(userId: string): Promise<ApiLimitResult> {
  const supabase = await createClient();

  try {
    // Chamar função do banco que verifica limite
    const { data, error } = await supabase.rpc('check_daily_api_limit', {
      p_user_id: userId,
      p_api_type: 'chatgpt',
      p_daily_limit: 5,
    });

    if (error) {
      console.error('Erro ao verificar limite da API:', error);
      // Em caso de erro, bloqueia por segurança
      return {
        canUse: false,
        usageCount: 0,
        limitValue: 5,
        resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
        message: 'Erro ao verificar limite. Tente novamente.',
      };
    }

    const result = data[0];

    return {
      canUse: result.can_use,
      usageCount: result.usage_count,
      limitValue: result.limit_value,
      resetAt: new Date(result.reset_at),
      message: result.can_use
        ? `${result.usage_count}/${result.limit_value} chamadas usadas hoje`
        : `Limite diário atingido (${result.limit_value}/${result.limit_value}). Reseta à meia-noite.`,
    };
  } catch (error) {
    console.error('Erro ao verificar limite:', error);
    return {
      canUse: false,
      usageCount: 0,
      limitValue: 5,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
      message: 'Erro ao verificar limite.',
    };
  }
}

/**
 * Registra uso da API do ChatGPT
 */
export async function logChatGPTUsage(
  userId: string,
  endpoint: string,
  tokensUsed: number = 0,
  requestData: any = {},
  responseData: any = {}
): Promise<void> {
  const supabase = await createClient();

  // Estimar custo (GPT-4o: ~$0.005 por 1k tokens input, ~$0.015 por 1k tokens output)
  // Usando média de $0.01 por 1k tokens
  const costEstimate = (tokensUsed / 1000) * 0.01;

  try {
    await supabase.rpc('log_api_usage', {
      p_user_id: userId,
      p_api_type: 'chatgpt',
      p_endpoint: endpoint,
      p_tokens_used: tokensUsed,
      p_cost_estimate: costEstimate,
      p_request_data: requestData,
      p_response_data: responseData,
    });
  } catch (error) {
    console.error('Erro ao registrar uso da API:', error);
    // Não bloqueia a aplicação se falhar o log
  }
}

/**
 * Obtém estatísticas de uso do usuário
 */
export async function getUserApiStats(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return [];
  }
}

