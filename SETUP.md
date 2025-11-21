# 🚀 Guia de Setup Rápido - BolsoCoin

Este guia irá te ajudar a configurar o BolsoCoin do zero em menos de 10 minutos.

## 📋 Checklist

- [ ] Node.js 18+ instalado
- [ ] Conta no Neon criada
- [ ] Conta no Clerk criada
- [ ] Chave OpenAI obtida
- [ ] (Opcional) Bot do Telegram criado

## 🔧 Passo a Passo

### 1. Clone e Instale

```bash
git clone https://github.com/oLucasJard/BolsoCoin.git
cd BolsoCoin
npm install
```

### 2. Configure o Neon (Database)

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Clique em "Create a project"
3. Copie a **Connection String** (DATABASE_URL)

### 3. Configure o Clerk (Autenticação)

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Clique em "Add application"
3. Escolha nome e métodos de login (Email, Google, GitHub, etc.)
4. Em "API Keys", copie:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 4. Configure a OpenAI

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em "Create new secret key"
3. Copie a chave (ela só aparece uma vez!)
4. Adicione créditos em [Billing](https://platform.openai.com/account/billing)

### 5. Crie o .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://seu_usuario:senha@host.neon.tech/neondb?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI
OPENAI_API_KEY=sk-...

# Telegram (Opcional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

### 6. Configure o Banco de Dados

```bash
npm run db:push
```

Este comando irá criar todas as tabelas necessárias no Neon.

### 7. Execute o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🎉 Pronto!

Você já pode:
1. Criar uma conta
2. Acessar o Dashboard
3. Usar a Página Mágica para adicionar transações com IA

## 🤖 (Opcional) Configurar Bot do Telegram

### 1. Criar o Bot

1. Abra o Telegram e fale com [@BotFather](https://t.me/BotFather)
2. Envie `/newbot`
3. Escolha um nome e username
4. Copie o **token** fornecido

### 2. Configurar Webhook

Adicione no `.env.local`:

```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_WEBHOOK_SECRET=uma_string_secreta_aleatoria
```

### 3. Configurar Webhook URL

Após fazer deploy na Vercel, configure o webhook:

```bash
curl -X POST "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-dominio.vercel.app/api/telegram-webhook",
    "secret_token": "sua_string_secreta"
  }'
```

## 🚀 Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Configure as mesmas variáveis de ambiente no painel da Vercel.

## ❓ Problemas Comuns

### "Invalid API Key" (OpenAI)
- Verifique se a chave está correta
- Confirme que tem créditos na conta

### "Database connection failed" (Neon)
- Verifique a DATABASE_URL
- Confirme que o IP está liberado

### "Unauthorized" (Clerk)
- Verifique as chaves
- Confirme que a aplicação está ativa

## 📚 Próximos Passos

- Explore a **Página Mágica** e adicione transações por texto
- Teste o upload de foto de recibo
- Configure o Bot do Telegram
- Customize as categorias

---

**Precisa de ajuda?** Abra uma issue no GitHub!

