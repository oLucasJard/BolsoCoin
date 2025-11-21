import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Forçar rota dinâmica para não ser pré-renderizada durante o build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Nenhum arquivo de áudio fornecido' }, { status: 400 });
    }

    // Criar cliente OpenAI apenas quando necessário
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Converter para formato aceito pela API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Erro na transcrição:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao transcrever áudio' },
      { status: 500 }
    );
  }
}
