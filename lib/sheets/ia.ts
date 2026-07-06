'use server';
import { extractTransactionFromText as openaiExtractText, extractTransactionFromImage as openaiExtractImage } from '@/lib/openai';
import { normalizeTipo, parseSheetDate, parseSheetNumber } from './utils';

function normalizeExtraction(result: Record<string, unknown>) {
  const amount = parseSheetNumber(result.amount);
  const type = normalizeTipo(result.type);
  const description = String(result.description || '').trim();
  const category = String(result.category || 'Outros').trim();
  const vendor = String(result.vendor || '').trim();
  const date = result.date ? parseSheetDate(result.date) : new Date().toISOString().split('T')[0];

  if (!description) throw new Error('Descrição não identificada');
  if (amount <= 0) throw new Error('Valor inválido ou não identificado');

  return {
    amount,
    type: type === 'receita' ? 'income' : 'expense',
    tipo: type,
    description,
    category,
    vendor,
    date,
  };
}

export async function processTextInput(text: string) {
  if (!text.trim()) throw new Error('Texto vazio');
  const result = await openaiExtractText(text);
  return normalizeExtraction(result as Record<string, unknown>);
}

export async function processImageInput(base64Image: string) {
  if (!base64Image) throw new Error('Imagem inválida');
  const result = await openaiExtractImage(base64Image);
  return normalizeExtraction(result as Record<string, unknown>);
}
