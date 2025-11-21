import { NextRequest, NextResponse } from 'next/server';
import { setupTelegramBot } from '@/lib/telegram-bot';

// Forçar rota dinâmica para não ser pré-renderizada durante o build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let bot: ReturnType<typeof setupTelegramBot> | null = null;

function getBot() {
  if (!bot) {
    bot = setupTelegramBot();
  }
  return bot;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot not configured' }, { status: 503 });
    }

    const body = await request.json();
    
    // Verificar secret do webhook
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const telegramBot = getBot();
    await telegramBot.handleUpdate(body);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
