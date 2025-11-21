import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const extractTransactionFromText = async (text: string) => {
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
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
};

export const extractTransactionFromImage = async (imageBase64: string) => {
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
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
};

export const transcribeAudio = async (audioFile: File) => {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'pt',
  });

  return transcription.text;
};

