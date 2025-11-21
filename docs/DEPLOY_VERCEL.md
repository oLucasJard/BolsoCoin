# 🚀 Deploy na Vercel - Guia Completo

## ✅ Status

**Data**: 21/11/2024  
**Build**: Corrigido e funcionando ✓  
**Problema resolvido**: OpenAI client com lazy loading

---

## 🔧 O que foi corrigido

### Problema Original
Durante o build, a Vercel tentava instanciar o cliente OpenAI sem a variável `OPENAI_API_KEY`, causando erro:
```
Error: The OPENAI_API_KEY environment variable is missing or empty
```

### Solução Implementada
1. ✅ **Lazy Loading**: OpenAI client só é criado quando realmente necessário
2. ✅ **Rotas Dinâmicas**: `/api/transcribe` e `/api/telegram-webhook` marcadas como dinâmicas
3. ✅ **Validação**: Verifica se API key existe antes de usar
4. ✅ **Build passa**: Testado localmente e pronto para Vercel

---

## 📋 Passo a Passo do Deploy

### 1. Conectar Repositório GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione o repositório **`oLucasJard/BolsoCoin`**
4. Clique em **"Import"**

### 2. Configurar Variáveis de Ambiente

**IMPORTANTE**: Antes de fazer o deploy, configure estas variáveis:

#### Variáveis Obrigatórias

```env
# Supabase (Obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Obrigatório para IA)
OPENAI_API_KEY=sk-proj-...
```

#### Variáveis Opcionais (Telegram Bot)

```env
# Telegram (Opcional)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_SECRET=seu_secret_random_aqui
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Como Adicionar Variáveis na Vercel

**Via Interface Web:**

1. No projeto na Vercel, vá em **"Settings"**
2. Clique em **"Environment Variables"**
3. Para cada variável:
   - **Key**: Nome da variável (ex: `OPENAI_API_KEY`)
   - **Value**: Valor da variável
   - **Environments**: Selecione `Production`, `Preview`, `Development`
4. Clique em **"Save"**

**Via CLI (Alternativa):**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Adicionar variáveis
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### 4. Deploy

Depois de configurar as variáveis:

1. Clique em **"Deploy"** na Vercel
2. Aguarde o build completar (2-3 minutos)
3. ✅ Sucesso! URL gerada: `https://bolsocoin.vercel.app`

---

## 🔍 Onde Encontrar as Variáveis

### Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Abra seu projeto
3. Vá em **"Settings"** → **"API"**
4. Copie:
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (opcional): `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login
3. Vá em **"API Keys"**
4. Clique em **"Create new secret key"**
5. Copie a chave gerada: `sk-proj-...`
6. **⚠️ Importante**: Salve em local seguro, não será exibida novamente

> 💡 **Custo**: Veja o [Guia OpenAI API](./GUIA_OPENAI_API.md) para detalhes de custos

### Telegram (Opcional)

1. Abra o Telegram
2. Fale com [@BotFather](https://t.me/BotFather)
3. Digite `/newbot` e siga as instruções
4. Copie o token gerado: `TELEGRAM_BOT_TOKEN`
5. Crie um secret aleatório: `TELEGRAM_WEBHOOK_SECRET`

---

## 🧪 Testar o Deploy

### 1. Verificar se o Build Passou

Na Vercel, você verá:

```
✓ Build completed in 2m 34s
✓ Static pages generated
✓ Deployed to production
```

### 2. Testar a Aplicação

1. **Acesse a URL** gerada pela Vercel
2. **Landing Page**: Deve carregar normalmente
3. **Login**: Tente fazer login/cadastro
4. **Dashboard**: Verifique se carrega após login

### 3. Testar Funcionalidades IA

**Sem OpenAI configurada:**
- ❌ Input de texto: Não funciona
- ❌ Input de áudio: Não funciona
- ❌ Input de imagem: Não funciona

**Com OpenAI configurada:**
- ✅ Input de texto: Funciona
- ✅ Input de áudio: Funciona (Whisper)
- ✅ Input de imagem: Funciona (GPT-4o Vision)

### 4. Testar no Mobile

**QR Code:**
1. Na Vercel, após o deploy, aparece um QR code
2. Escaneie com a câmera do celular
3. Teste a navegação mobile (bottom nav)
4. Verifique se o design C6 Bank está bonito

**Manual:**
1. Copie a URL do deploy
2. Abra no navegador do celular
3. Adicione à tela inicial (PWA)

---

## 🐛 Problemas Comuns

### 1. Build Falha com "OPENAI_API_KEY missing"

**Solução**: Adicione a variável `OPENAI_API_KEY` nas configurações da Vercel

### 2. "Supabase client not initialized"

**Solução**: 
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está correta
- Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correta
- **Importante**: Variáveis com `NEXT_PUBLIC_` devem ser visíveis no build

### 3. Login não funciona

**Causas possíveis:**
1. **Supabase não configurado**: Execute o schema SQL no Supabase
2. **URLs não autorizadas**: Configure URLs na Vercel no Supabase
3. **RLS não configurado**: Verifique as políticas de segurança

**Configurar URLs no Supabase:**
1. Vá em **"Authentication"** → **"URL Configuration"**
2. Adicione a URL da Vercel em:
   - **Site URL**: `https://bolsocoin.vercel.app`
   - **Redirect URLs**: `https://bolsocoin.vercel.app/auth/callback`

### 4. IA não funciona

**Causas possíveis:**
1. **OpenAI API key inválida**: Verifique a chave
2. **Sem créditos**: Adicione créditos na OpenAI
3. **Rate limit**: Aguarde alguns minutos

**Verificar créditos OpenAI:**
1. Acesse [platform.openai.com/usage](https://platform.openai.com/usage)
2. Veja o uso atual
3. Adicione créditos se necessário

---

## 📊 Monitoramento

### Vercel Analytics

1. Na Vercel, vá em **"Analytics"**
2. Monitore:
   - **Page Views**: Quantas visitas
   - **Top Pages**: Páginas mais acessadas
   - **Core Web Vitals**: Performance

### Logs em Tempo Real

1. Na Vercel, vá em **"Logs"**
2. Escolha:
   - **Runtime Logs**: Erros em produção
   - **Build Logs**: Erros no build

### Custos OpenAI

1. Acesse [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitore uso diário
3. Configure alertas de gasto

---

## 🔄 Redeploy e Atualizações

### Deploy Automático

**A Vercel faz deploy automático quando você:**
1. Faz `git push` para a branch `main`
2. Merge de um Pull Request
3. Qualquer commit na branch principal

### Deploy Manual

1. Na Vercel, vá em **"Deployments"**
2. Clique nos 3 pontos do deploy anterior
3. Clique em **"Redeploy"**

### Rollback (Voltar Versão)

1. Na Vercel, vá em **"Deployments"**
2. Escolha um deploy anterior
3. Clique em **"Promote to Production"**

---

## 🚀 Otimizações Pós-Deploy

### 1. Domínio Customizado

1. Compre um domínio (ex: `bolsocoin.com`)
2. Na Vercel, vá em **"Settings"** → **"Domains"**
3. Adicione seu domínio
4. Configure DNS conforme instruções

### 2. Edge Functions (Opcional)

Para melhor performance global:
1. Na Vercel, vá em **"Settings"** → **"Functions"**
2. Habilite **"Edge Functions"**
3. Rotas serão executadas mais próximo do usuário

### 3. Caching

A Vercel faz caching automático:
- ✅ Páginas estáticas: Cache infinito
- ✅ API Routes dinâmicas: Sem cache
- ✅ Assets (CSS/JS): Cache com hash

### 4. Preview Deployments

Cada Pull Request gera um deploy de preview:
- URL única para testar
- Não afeta produção
- Pode compartilhar com equipe

---

## 📱 PWA (Progressive Web App)

Para transformar em app instalável:

1. Adicione `manifest.json`:
```json
{
  "name": "BolsoCoin",
  "short_name": "BolsoCoin",
  "description": "Gerenciamento financeiro com IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FFD100",
  "icons": [...]
}
```

2. Adicione Service Worker
3. Redeploy na Vercel

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Build passa sem erros na Vercel
- [ ] Landing page carrega
- [ ] Login/Signup funcionam
- [ ] Dashboard exibe dados
- [ ] IA processa transações (se OpenAI configurada)
- [ ] Mobile funciona perfeitamente
- [ ] Bottom navigation mobile está correta
- [ ] Design C6 Bank está bonito
- [ ] Performance é boa (< 3s de carregamento)
- [ ] URLs configuradas no Supabase
- [ ] Variáveis de ambiente todas configuradas

---

## 📞 Suporte

**Problemas no Deploy?**
- 📧 Suporte Vercel: [vercel.com/support](https://vercel.com/support)
- 📖 Docs Vercel: [vercel.com/docs](https://vercel.com/docs)
- 📖 Docs Supabase: [supabase.com/docs](https://supabase.com/docs)

**Outros Guias:**
- [Setup Completo](./SETUP.md)
- [OpenAI API](./GUIA_OPENAI_API.md)
- [Login Real](./GUIA_LOGIN_REAL.md)
- [Testes Mobile](./TESTES_MOBILE.md)

---

**Desenvolvido com 💚 por BRANDUP HUB**

**Deploy com sucesso!** 🚀✨

