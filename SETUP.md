# 🚀 Guia de Setup Rápido - BolsoCoin

Este guia irá te ajudar a configurar o BolsoCoin do zero em menos de 10 minutos.

## 📋 Checklist

- [ ] Node.js 18+ instalado
- [ ] Conta no Supabase criada
- [ ] Chave OpenAI obtida
- [ ] (Opcional) Bot do Telegram criado

## 🔧 Passo a Passo

### 1. Clone e Instale

```bash
git clone https://github.com/oLucasJard/BolsoCoin.git
cd BolsoCoin
npm install
```

### 2. Configure o Supabase (Database + Auth)

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados do projeto
4. Aguarde o projeto ser criado
5. Em "Project Settings → API", copie:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)

### 3. Configure o Banco de Dados

No Supabase Dashboard:

1. Vá em "SQL Editor"
2. Clique em "New query"
3. Cole todo o conteúdo do arquivo `supabase/schema.sql`
4. Clique em "Run" para executar

Isso irá criar:
- Tabelas (profiles, transactions, categories)
- Políticas de segurança (RLS)
- Triggers automáticos
- Índices de performance

### 4. Configure a OpenAI

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em "Create new secret key"
3. Copie a chave (ela só aparece uma vez!)
4. Adicione créditos em [Billing](https://platform.openai.com/account/billing)

### 5. Crie o .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui

# OpenAI
OPENAI_API_KEY=sk-...

# Telegram (Opcional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

### 6. Execute o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🎉 Pronto!

Você já pode:
1. Criar uma conta
2. Acessar o Dashboard
3. Usar a Página Mágica para adicionar transações com IA

## 🔐 (Opcional) Configurar Login Social

### Google OAuth

No Supabase Dashboard:

1. Vá em "Authentication → Providers"
2. Ative o "Google"
3. Crie credenciais no [Google Cloud Console](https://console.cloud.google.com):
   - Crie um projeto
   - Ative a "Google+ API"
   - Crie credenciais OAuth 2.0
   - Adicione a Redirect URI do Supabase
4. Cole Client ID e Secret no Supabase

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

### "Database connection failed" (Supabase)
- Verifique a NEXT_PUBLIC_SUPABASE_URL
- Confirme que as tabelas foram criadas (execute schema.sql)

### "Unauthorized" (Supabase)
- Verifique as chaves
- Confirme que o RLS está ativo nas tabelas

## 📚 Próximos Passos

- Explore a **Página Mágica** e adicione transações por texto
- Teste o upload de foto de recibo
- Configure o Bot do Telegram
- Configure login social (Google)

---

**Precisa de ajuda?** Abra uma issue no GitHub!
