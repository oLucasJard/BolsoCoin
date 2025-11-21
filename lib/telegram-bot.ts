import { Telegraf } from 'telegraf';
import { db } from './db';
import { users, transactions } from './db/schema';
import { eq } from 'drizzle-orm';
import { extractTransactionFromText } from './openai';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Mapear chatId -> userId (Clerk)
const chatIdToUserId = new Map<number, string>();

export function setupTelegramBot() {
  // Comando /start
  bot.command('start', async (ctx) => {
    await ctx.reply(
      '💰 Bem-vindo ao BolsoCoin!\n\n' +
      'Para começar, você precisa vincular sua conta.\n' +
      'Acesse o site e vá em Perfil para obter seu código de vinculação.\n\n' +
      'Comandos disponíveis:\n' +
      '/saldo - Ver saldo atual\n' +
      '/gastos_hoje - Ver gastos do dia\n' +
      '/help - Ajuda'
    );
  });

  // Comando /help
  bot.command('help', async (ctx) => {
    await ctx.reply(
      '💡 Como usar o BolsoCoin:\n\n' +
      '1. Envie uma mensagem com sua transação:\n' +
      '   Ex: "Café 15 reais"\n' +
      '   Ex: "Gasolina 200 posto Shell"\n\n' +
      '2. Use comandos:\n' +
      '   /saldo - Ver saldo atual\n' +
      '   /gastos_hoje - Ver gastos do dia\n\n' +
      '3. Envie uma foto de um recibo para extrair automaticamente os dados'
    );
  });

  // Comando /saldo
  bot.command('saldo', async (ctx) => {
    const userId = chatIdToUserId.get(ctx.chat.id);
    if (!userId) {
      await ctx.reply('Você precisa vincular sua conta primeiro. Use /start para instruções.');
      return;
    }

    try {
      const userTransactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
      });

      const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const balance = income - expense;

      await ctx.reply(
        `💰 Seu Saldo:\n\n` +
        `Receitas: R$ ${income.toFixed(2)}\n` +
        `Despesas: R$ ${expense.toFixed(2)}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `Saldo: R$ ${balance.toFixed(2)}`
      );
    } catch (error) {
      await ctx.reply('Erro ao buscar saldo. Tente novamente mais tarde.');
    }
  });

  // Comando /gastos_hoje
  bot.command('gastos_hoje', async (ctx) => {
    const userId = chatIdToUserId.get(ctx.chat.id);
    if (!userId) {
      await ctx.reply('Você precisa vincular sua conta primeiro. Use /start para instruções.');
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
      });

      const todayExpenses = todayTransactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= today)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      await ctx.reply(
        `📊 Gastos de Hoje:\n\n` +
        `Total: R$ ${todayExpenses.toFixed(2)}`
      );
    } catch (error) {
      await ctx.reply('Erro ao buscar gastos. Tente novamente mais tarde.');
    }
  });

  // Processar mensagens de texto (transações)
  bot.on('text', async (ctx) => {
    const userId = chatIdToUserId.get(ctx.chat.id);
    if (!userId) {
      await ctx.reply('Você precisa vincular sua conta primeiro. Use /start para instruções.');
      return;
    }

    const text = ctx.message.text;

    // Ignorar comandos
    if (text.startsWith('/')) return;

    try {
      await ctx.reply('🤖 Processando...');

      const extracted = await extractTransactionFromText(text);

      // Enviar confirmação
      const confirmMessage =
        `✅ Transação extraída:\n\n` +
        `Tipo: ${extracted.type === 'income' ? '💰 Receita' : '💸 Despesa'}\n` +
        `Valor: R$ ${parseFloat(extracted.amount).toFixed(2)}\n` +
        `Descrição: ${extracted.description}\n` +
        `Categoria: ${extracted.category}\n` +
        (extracted.vendor ? `Fornecedor: ${extracted.vendor}\n` : '') +
        `\n` +
        `Confirmar?`;

      await ctx.reply(confirmMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Sim', callback_data: `confirm:${JSON.stringify(extracted)}` },
              { text: '❌ Não', callback_data: 'cancel' },
            ],
          ],
        },
      });
    } catch (error) {
      await ctx.reply('Erro ao processar transação. Verifique o formato e tente novamente.');
    }
  });

  // Processar respostas de botões
  bot.on('callback_query', async (ctx) => {
    const userId = chatIdToUserId.get(ctx.chat!.id);
    if (!userId) {
      await ctx.answerCbQuery('Você precisa vincular sua conta primeiro.');
      return;
    }

    const data = ctx.callbackQuery.data;

    if (data === 'cancel') {
      await ctx.answerCbQuery('Cancelado');
      await ctx.editMessageText('❌ Transação cancelada.');
      return;
    }

    if (data?.startsWith('confirm:')) {
      try {
        const extracted = JSON.parse(data.replace('confirm:', ''));

        await db.insert(transactions).values({
          userId,
          amount: extracted.amount.toString(),
          description: extracted.description,
          type: extracted.type,
          categoryName: extracted.category,
          vendor: extracted.vendor,
          date: extracted.date ? new Date(extracted.date) : new Date(),
          rawInput: extracted.rawInput,
          source: 'telegram',
        });

        await ctx.answerCbQuery('Transação adicionada!');
        await ctx.editMessageText('✅ Transação adicionada com sucesso!');
      } catch (error) {
        await ctx.answerCbQuery('Erro ao salvar');
        await ctx.editMessageText('❌ Erro ao salvar transação.');
      }
    }
  });

  // Processar fotos
  bot.on('photo', async (ctx) => {
    await ctx.reply('📸 Processamento de imagens via Telegram estará disponível em breve!');
  });

  return bot;
}

// Função para vincular um chat do Telegram a um usuário
export async function linkTelegramChat(userId: string, chatId: string) {
  await db.update(users)
    .set({ telegramChatId: chatId, updatedAt: new Date() })
    .where(eq(users.id, userId));

  chatIdToUserId.set(parseInt(chatId), userId);
}

