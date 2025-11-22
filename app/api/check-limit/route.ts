import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkChatGPTLimit } from '@/lib/api-limit';

export const dynamic = 'force-dynamic';

/**
 * Verifica limite diário de uso da API do ChatGPT
 * GET /api/check-limit
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const limit = await checkChatGPTLimit(user.id);

    return NextResponse.json({
      canUse: limit.canUse,
      usageCount: limit.usageCount,
      limitValue: limit.limitValue,
      resetAt: limit.resetAt,
      message: limit.message,
    });
  } catch (error: any) {
    console.error('Erro ao verificar limite:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar limite' },
      { status: 500 }
    );
  }
}

