import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Serviço de transcrição indisponível.' },
        { status: 503 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success } = rateLimit('transcribe', ip, 10, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um minuto e tente novamente.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo de áudio fornecido.' }, { status: 400 });
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 });
    }

    if (audioFile.type && !ALLOWED_TYPES.some((t) => audioFile.type.startsWith(t.split('/')[0]))) {
      if (!audioFile.type.startsWith('audio/')) {
        return NextResponse.json({ error: 'Formato de áudio não suportado.' }, { status: 400 });
      }
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Erro na transcrição:', error);
    return NextResponse.json(
      { error: 'Erro ao transcrever áudio. Tente novamente.' },
      { status: 500 }
    );
  }
}
