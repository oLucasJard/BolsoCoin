import { NextRequest, NextResponse } from 'next/server';
import { setupTelegramBot } from '@/lib/telegram-bot';

const bot = setupTelegramBot();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar secret do webhook
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await bot.handleUpdate(body);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

