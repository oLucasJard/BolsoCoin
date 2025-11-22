'use server';

import { createClient } from '@/lib/supabase/server';
import { extractTransactionFromText, extractTransactionFromImage } from '@/lib/openai';
import { checkChatGPTLimit, logChatGPTUsage } from '@/lib/api-limit';

/**
 * Processa entrada de texto usando IA do ChatGPT
 * COM limite diário de 5 chamadas
 */
export async function processTextInput(text: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // VERIFICAR LIMITE ANTES DE PROCESSAR
  const limit = await checkChatGPTLimit(user.id);
  
  if (!limit.canUse) {
    throw new Error(
      `Limite diário de chamadas à IA atingido (${limit.usageCount}/${limit.limitValue}). ` +
      `Resets à meia-noite. Use o botão "Adicionar Manualmente" para criar sem IA.`
    );
  }

  try {
    // Processar com OpenAI
    const result = await extractTransactionFromText(text);

    // Registrar uso da API
    await logChatGPTUsage(
      user.id,
      'processTextInput',
      150, // Estimativa de tokens
      { text },
      { result }
    );

    return result;
  } catch (error: any) {
    console.error('Erro ao processar texto:', error);
    throw new Error(error.message || 'Erro ao processar texto');
  }
}

/**
 * Processa imagem (recibo/nota fiscal) usando IA do ChatGPT
 * COM limite diário de 5 chamadas
 */
export async function processImageInput(base64Image: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // VERIFICAR LIMITE ANTES DE PROCESSAR
  const limit = await checkChatGPTLimit(user.id);
  
  if (!limit.canUse) {
    throw new Error(
      `Limite diário de chamadas à IA atingido (${limit.usageCount}/${limit.limitValue}). ` +
      `Resets à meia-noite. Use o botão "Adicionar Manualmente" para criar sem IA.`
    );
  }

  try {
    // Processar com OpenAI Vision
    const result = await extractTransactionFromImage(base64Image);

    // Registrar uso da API
    await logChatGPTUsage(
      user.id,
      'processImageInput',
      250, // Estimativa de tokens (imagens usam mais)
      { imageLength: base64Image.length },
      { result }
    );

    return result;
  } catch (error: any) {
    console.error('Erro ao processar imagem:', error);
    throw new Error(error.message || 'Erro ao processar imagem');
  }
}

