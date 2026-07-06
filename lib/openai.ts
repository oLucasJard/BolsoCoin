import OpenAI from 'openai';
import { z } from 'zod';

let openaiInstance: OpenAI | null = null;

const transactionSchema = z.object({
  amount: z.union([z.number(), z.string()]).optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  date: z.string().optional(),
});

function getOpenAIClient() {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada.');
    }
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiInstance;
}

function parseAIResponse(content: string | null) {
  if (!content) throw new Error('Resposta vazia da IA');
  try {
    const parsed = JSON.parse(content);
    return transactionSchema.parse(parsed);
  } catch {
    throw new Error('Resposta inválida da IA');
  }
}

export const extractTransactionFromText = async (text: string) => {
  if (text.length > 2000) throw new Error('Texto muito longo (máx. 2000 caracteres)');
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente financeiro que extrai informações de transações de texto em linguagem natural.
Analise o texto e extraia:
- amount (número, sempre positivo)
- type ("income" para receitas ou "expense" para despesas)
- description (descrição clara)
- category (categoria sugerida: Alimentação, Transporte, Saúde, Lazer, Moradia, Educação, Compras, Serviços, Outros, Salário, Freelance, Investimentos)
- vendor (nome do estabelecimento/pessoa, se mencionado)
- date (data da transação, se mencionada, no formato ISO 8601, senão use a data atual)

Responda APENAS com um JSON válido, sem texto adicional.`,
      },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
  });

  return parseAIResponse(completion.choices[0].message.content);
};

export const extractTransactionFromImage = async (imageBase64: string) => {
  if (imageBase64.length > 14_000_000) throw new Error('Imagem muito grande');
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente financeiro que extrai informações de recibos e cupons fiscais de imagens.
Analise a imagem e extraia:
- amount (valor total da compra, número sempre positivo)
- type (sempre "expense" para recibos)
- description (breve descrição do que foi comprado)
- category (categoria sugerida baseada nos itens)
- vendor (nome do estabelecimento)
- date (data da compra, se visível, no formato ISO 8601)

Responda APENAS com um JSON válido, sem texto adicional.`,
      },
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }],
      },
    ],
    response_format: { type: 'json_object' },
  });

  return parseAIResponse(completion.choices[0].message.content);
};
