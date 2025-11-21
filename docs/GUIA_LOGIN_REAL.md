# 🔐 Guia de Login Real - BolsoCoin

## ✅ Status: Configuração Completa

O BolsoCoin está configurado com **Supabase Auth** para autenticação real!

---

## 🎯 O Que Você Tem Agora

### ✅ Features de Autenticação Implementadas

1. **Cadastro de Usuários** (`/signup`)
   - Email + Senha
   - Login com Google (configurável)
   - Validação de dados
   - Criação automática de perfil

2. **Login de Usuários** (`/login`)
   - Email + Senha
   - Login com Google (configurável)
   - Sessão persistente
   - Redirecionamento automático

3. **Proteção de Rotas** (Middleware)
   - Rotas protegidas: `/dashboard`, `/transacoes`, `/magica`, `/orcamentos`
   - Redirecionamento automático se não autenticado
   - Validação de sessão em tempo real

4. **Logout** (UserButton)
   - Logout com um clique
   - Limpeza de sessão
   - Redirecionamento para home

5. **Dev Login** (`/dev-login`)
   - Login instantâneo para testes
   - Usuário: `teste@bolsocoin.dev`
   - Senha: `teste123456`

---

## 🚀 Como Testar o Login Real

### Pré-requisitos

✅ Supabase configurado  
✅ `.env.local` com as credenciais  
✅ Schema SQL executado  
✅ Servidor rodando (`npm run dev`)

### Checklist de Configuração

Execute este checklist para garantir que está tudo certo:

```bash
# 1. Verificar se o .env.local existe
ls -la .env.local

# 2. Verificar se as variáveis estão definidas
cat .env.local | grep SUPABASE

# Deve mostrar:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Rodar o projeto
npm run dev

# 4. Acessar
http://localhost:3000
```

---

## 📝 Teste 1: Cadastro de Nova Conta

### Passo a Passo

1. **Acesse a página de cadastro**:
   ```
   http://localhost:3000/signup
   ```

2. **Preencha o formulário**:
   - Nome: Seu nome
   - Email: seu.email@teste.com
   - Senha: mínimo 6 caracteres

3. **Clique em "Criar Conta"**

4. **O que deve acontecer**:
   - ✅ Mensagem: "Conta criada! Verifique seu email para confirmar"
   - ✅ Redirecionamento para `/login`
   - ✅ Email de confirmação enviado (verifique seu email)

### ⚠️ Notas Importantes

#### Confirmação de Email

Por padrão, o Supabase envia email de confirmação. Você tem 2 opções:

**Opção A: Confirmar Email (Produção)**
1. Verifique sua caixa de entrada
2. Clique no link de confirmação
3. Faça login normalmente

**Opção B: Desabilitar Confirmação (Desenvolvimento)**
1. Vá no Supabase Dashboard
2. `Authentication → Settings`
3. Desmarque "Enable email confirmations"
4. Salve
5. Agora pode fazer login direto após cadastro

---

## 🔑 Teste 2: Login com Email/Senha

### Passo a Passo

1. **Acesse a página de login**:
   ```
   http://localhost:3000/login
   ```

2. **Preencha suas credenciais**:
   - Email: seu.email@teste.com
   - Senha: sua senha

3. **Clique em "Entrar"**

4. **O que deve acontecer**:
   - ✅ Mensagem: "Login realizado com sucesso!"
   - ✅ Redirecionamento para `/dashboard`
   - ✅ UserButton aparece no canto superior direito
   - ✅ Dashboard carrega com seus dados

### Troubleshooting

#### ❌ "Email not confirmed"
**Solução**: Confirme o email ou desabilite confirmação (ver acima)

#### ❌ "Invalid login credentials"
**Solução**: Verifique email/senha ou crie nova conta

#### ❌ Redirecionamento em loop
**Solução**: Limpe cookies e tente novamente

---

## ⚡ Teste 3: Dev Login (Teste Rápido)

### Passo a Passo

1. **Acesse**:
   ```
   http://localhost:3000/dev-login
   ```

2. **Clique em "Login Instantâneo de Teste"**

3. **O que acontece**:
   - ✅ Se usuário não existir, é criado automaticamente
   - ✅ Login automático
   - ✅ Redirecionamento para `/dashboard`

### Credenciais do Dev Login

```
Email: teste@bolsocoin.dev
Senha: teste123456
```

Você pode usar essas credenciais também no login normal!

---

## 🔒 Teste 4: Proteção de Rotas

### Como Testar

1. **Faça logout** (ou abra navegador anônimo)

2. **Tente acessar rotas protegidas diretamente**:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/transacoes
   http://localhost:3000/magica
   http://localhost:3000/orcamentos
   ```

3. **O que deve acontecer**:
   - ✅ Redirecionamento automático para `/login`
   - ✅ Mensagem indicando que precisa fazer login

4. **Após fazer login**:
   - ✅ Pode acessar todas as rotas protegidas
   - ✅ Navegação livre entre páginas

---

## 🚪 Teste 5: Logout

### Passo a Passo

1. **Estando logado, clique no botão do usuário** (canto superior direito)

2. **Aparecerá um dropdown com**:
   - Nome do usuário
   - Email
   - Botão "Sair"

3. **Clique em "Sair"**

4. **O que deve acontecer**:
   - ✅ Mensagem: "Logout realizado com sucesso!"
   - ✅ Redirecionamento para `/` (home)
   - ✅ Não consegue mais acessar rotas protegidas

---

## 🔄 Teste 6: Persistência de Sessão

### Como Testar

1. **Faça login normalmente**

2. **Navegue entre as páginas**:
   - Dashboard → Transações → Página Mágica → Orçamentos

3. **Feche o navegador completamente**

4. **Abra novamente e acesse**:
   ```
   http://localhost:3000/dashboard
   ```

5. **O que deve acontecer**:
   - ✅ Você ainda está logado
   - ✅ Dashboard carrega normalmente
   - ✅ Seus dados aparecem

### Como Funciona

O Supabase Auth usa **cookies httpOnly** para manter a sessão:
- Cookie é salvo no navegador
- Válido por 7 dias (padrão)
- Renovado automaticamente
- Seguro contra XSS

---

## 🔐 Teste 7: Login com Google (Opcional)

### Configuração Necessária

Antes de testar, configure no Supabase:

1. **Vá no Supabase Dashboard**
   ```
   Authentication → Providers → Google
   ```

2. **Configure**:
   - Ative o provedor Google
   - Adicione Client ID e Secret do Google Cloud
   - Configure redirect URL

3. **Google Cloud Console**:
   - Crie projeto
   - Habilite Google+ API
   - Crie credenciais OAuth 2.0
   - Adicione redirect URI do Supabase

### Testando

1. **Vá para `/login` ou `/signup`**

2. **Clique no botão "Continue com Google"**

3. **Selecione sua conta Google**

4. **O que acontece**:
   - ✅ Redirecionamento para Google
   - ✅ Seleção de conta
   - ✅ Callback para aplicação
   - ✅ Login automático
   - ✅ Perfil criado automaticamente

---

## 🧪 Teste 8: Criação Automática de Perfil

### Como Verificar

1. **Crie uma nova conta**

2. **Faça login**

3. **Vá no Supabase Dashboard**:
   ```
   Table Editor → profiles
   ```

4. **Verifique**:
   - ✅ Linha criada automaticamente
   - ✅ ID = ID do auth.users
   - ✅ Email preenchido
   - ✅ Name preenchido
   - ✅ Currency = 'BRL'

### Como Funciona

O **trigger** `on_auth_user_created` faz isso automaticamente:

```sql
-- Quando um usuário é criado em auth.users
-- Automaticamente cria registro em profiles
```

---

## 📊 Verificando no Supabase Dashboard

### Authentication

1. **Acesse**: `Authentication → Users`

2. **Veja**:
   - Todos os usuários cadastrados
   - Status (confirmado/não confirmado)
   - Último login
   - Provider (email, google, etc)

### Profiles Table

1. **Acesse**: `Table Editor → profiles`

2. **Veja**:
   - Perfis criados automaticamente
   - Dados de cada usuário
   - Timestamps

### Logs

1. **Acesse**: `Authentication → Logs`

2. **Veja**:
   - Tentativas de login
   - Cadastros
   - Erros
   - Tokens gerados

---

## 🐛 Troubleshooting Comum

### 1. "Invalid API Key"

**Problema**: Credenciais do Supabase incorretas

**Solução**:
```bash
# Verifique o .env.local
cat .env.local

# Copie novamente do Supabase:
# Settings → API → Project URL e anon/public key
```

### 2. "Failed to fetch"

**Problema**: URL do Supabase incorreta

**Solução**:
```bash
# Verifique se a URL está completa:
NEXT_PUBLIC_SUPABASE_URL=https://seuprojeto.supabase.co
```

### 3. "Email not confirmed"

**Problema**: Email precisa ser confirmado

**Solução**:
1. Confirme o email
2. OU desabilite confirmação em Auth Settings

### 4. "Row level security policy violation"

**Problema**: RLS ativo mas policies não criadas

**Solução**:
```bash
# Execute o schema.sql completo no Supabase SQL Editor
```

### 5. "Profile not found"

**Problema**: Trigger não executou

**Solução**:
```sql
-- Recriar o trigger (execute no SQL Editor)
-- Ver supabase/schema.sql linhas 90-107
```

### 6. Redirecionamento Infinito

**Problema**: Middleware ou auth com problema

**Solução**:
```bash
# Limpe cookies do navegador
# Ou abra aba anônima e teste
```

---

## ✅ Checklist Final de Testes

Use este checklist para validar tudo:

- [ ] Cadastro de nova conta funciona
- [ ] Email de confirmação recebido (ou desabilitado)
- [ ] Login com email/senha funciona
- [ ] Dev Login funciona
- [ ] Redirecionamento para dashboard após login
- [ ] UserButton aparece quando logado
- [ ] Rotas protegidas redirecionam para login
- [ ] Logout funciona
- [ ] Sessão persiste após fechar navegador
- [ ] Perfil criado automaticamente
- [ ] Dashboard carrega dados do usuário
- [ ] Página Mágica funciona
- [ ] Transações podem ser criadas
- [ ] Orçamentos podem ser criados

---

## 🎯 Próximos Passos Após Configuração

Agora que o login está funcionando:

### 1. Teste as Features

- ✅ Adicione transações via texto
- ✅ Teste upload de foto de recibo
- ✅ Grave áudio de transação
- ✅ Crie orçamentos
- ✅ Defina metas

### 2. Personalize

- Altere seu nome no perfil
- Mude a moeda (se não for BRL)
- Configure categorias favoritas

### 3. Explore

- Veja os gráficos no dashboard
- Compare orçamentos
- Acompanhe metas

---

## 🔐 Segurança

### O Que Está Protegido

✅ **Senhas**: Hasheadas pelo Supabase (bcrypt)  
✅ **Sessões**: Cookies httpOnly (seguro contra XSS)  
✅ **Dados**: Row Level Security (RLS)  
✅ **API**: Todas as rotas validam autenticação  
✅ **Tokens**: Renovados automaticamente  

### Boas Práticas

1. **Nunca compartilhe**:
   - SUPABASE_ANON_KEY (mas pode ser exposta no frontend)
   - SUPABASE_SERVICE_KEY (se usar)

2. **Use senhas fortes**:
   - Mínimo 8 caracteres
   - Combine letras, números e símbolos

3. **Habilite 2FA** (quando disponível no Supabase)

---

## 📱 Testando em Múltiplos Dispositivos

### Desktop

```bash
http://localhost:3000
```

### Mobile (mesma rede)

1. **Descubra seu IP local**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Acesse do celular**:
   ```
   http://SEU_IP:3000
   ```

3. **Teste tudo novamente**:
   - Cadastro
   - Login
   - Navegação
   - Logout

---

## 🎉 Resumo

### ✅ O Que Funciona

- ✅ Cadastro completo
- ✅ Login com email/senha
- ✅ Login com Google (após configurar)
- ✅ Dev Login para testes
- ✅ Proteção de rotas
- ✅ Logout
- ✅ Persistência de sessão
- ✅ Criação automática de perfil
- ✅ Row Level Security

### 🚀 Pronto Para

- ✅ Desenvolvimento local
- ✅ Testes em produção
- ✅ Deploy na Vercel
- ✅ Uso real

---

## 📚 Recursos Adicionais

### Documentação

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Patterns](https://nextjs.org/docs/authentication)
- [Código do Projeto](https://github.com/oLucasJard/BolsoCoin)

### Arquivos Relevantes

```
app/(auth)/login/page.tsx          # Página de login
app/(auth)/signup/page.tsx         # Página de cadastro
app/(auth)/dev-login/page.tsx      # Dev login
app/auth/callback/route.ts         # Callback OAuth
components/UserButton.tsx          # Botão de usuário/logout
lib/supabase/client.ts            # Cliente browser
lib/supabase/server.ts            # Cliente server
lib/supabase/middleware.ts        # Auth middleware
middleware.ts                      # Middleware Next.js
```

---

**Última atualização**: 21/11/2024  
**Status**: ✅ COMPLETO E FUNCIONAL  
**Desenvolvido por**: BRANDUP HUB 💚

