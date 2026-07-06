'use server';
import { extractTransactionFromText as openaiExtractText, extractTransactionFromImage as openaiExtractImage } from '@/lib/openai';

export async function processTextInput(text: string) {
  const result = await openaiExtractText(text);
  return {
    amount: result.amount,
    type: result.type,
    description: result.description,
    category: result.category,
    vendor: result.vendor,
    date: result.date,
  };
}

export async function processImageInput(base64Image: string) {
  const result = await openaiExtractImage(base64Image);
  return {
    amount: result.amount,
    type: result.type,
    description: result.description,
    category: result.category,
    vendor: result.vendor,
    date: result.date,
  };
}
