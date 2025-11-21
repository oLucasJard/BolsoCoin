# 🔄 Migração para Supabase - BolsoCoin

## ✅ Status: COMPLETO

O BolsoCoin foi migrado com sucesso de **Neon + Drizzle + Clerk** para **Supabase** (Database + Auth).

## 🎯 O que mudou

### Antes
- **Database**: Neon PostgreSQL Serverless
- **ORM**: Drizzle ORM
- **Auth**: Clerk

### Depois
- **Database**: Supabase PostgreSQL
- **ORM**: Supabase Client (nativo)
- **Auth**: Supabase Auth

## 🚀 Vantagens da Migração

### ✅ Simplicidade
- **Antes**: 3 serviços diferentes (Neon, Drizzle, Clerk)
- **Depois**: 1 serviço unificado (Supabase)

### ✅ Custo
- **Antes**: Potencialmente 3 cobranças separadas
- **Depois**: 1 cobrança única, tier gratuito generoso

### ✅ Developer Experience
- **Antes**: Configurar 3 serviços, 3 dashboards
- **Depois**: 1 dashboard, setup mais rápido

### ✅ Features Incluídas
- Row Level Security (RLS) nativo
- Autenticação completa (email, OAuth)
- Realtime subscriptions (future use)
- Storage para imagens (future use)
- Edge Functions (future use)

## 📋 Alterações Realizadas

### 1. Dependências Atualizadas

**Removidas:**
```json
"@clerk/nextjs": "^5.7.1",
"@neondatabase/serverless": "^0.9.5",
"drizzle-orm": "^0.33.0",
"drizzle-kit": "^0.24.2"
```

**Adicionadas:**
```json
"@supabase/supabase-js": "^2.45.4",
"@supabase/ssr": "^0.5.1"
```

### 2. Estrutura de Arquivos Criada

```
lib/supabase/
├── client.ts      # Cliente browser
├── server.ts      # Cliente server  
├── middleware.ts  # Middleware auth
└── types.ts       # Types do database

supabase/
└── schema.sql     # Schema completo do banco
```

### 3. Arquivos Removidos

```
drizzle.config.ts
lib/db/schema.ts
lib/db/index.ts
app/(auth)/sign-in/[[...sign-in]]/page.tsx (Clerk)
app/(auth)/sign-up/[[...sign-up]]/page.tsx (Clerk)
```

### 4. Arquivos Criados

```
lib/supabase/ (4 arquivos)
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/auth/callback/route.ts
components/UserButton.tsx
supabase/schema.sql
middleware.ts (novo, para Supabase)
```

### 5. Server Actions Reescritas

Todos os arquivos em `lib/actions/` foram reescritos para usar:
- Supabase client ao invés de Drizzle
- `auth.getUser()` ao invés de Clerk
- Queries SQL nativas do Supabase

### 6. Componentes Atualizados

- **Navbar.tsx**: Removido `UserButton` do Clerk, usando custom
- **UserButton.tsx**: Novo componente custom com Supabase Auth
- **TransactionList.tsx**: Tipos atualizados para Supabase
- **Layout principal**: Removido `ClerkProvider`

## 🗄️ Schema do Banco de Dados

O schema foi mantido praticamente idêntico:

### Tabelas
1. **profiles** (antes: users)
   - Estende `auth.users` do Supabase
   - Trigger automático cria profile ao registrar

2. **transactions**
   - Mesma estrutura
   - RLS policies ativas

3. **categories**
   - Mesma estrutura
   - RLS policies ativas

### Recursos Supabase
- **Row Level Security (RLS)**: Ativo em todas as tabelas
- **Triggers**: Criação automática de profile
- **Policies**: Usuários só veem seus próprios dados

## 🔐 Autenticação

### Antes (Clerk)
- Componentes pré-prontos
- Rotas automáticas
- Middleware do Clerk

### Depois (Supabase Auth)
- Páginas custom de login/signup
- OAuth providers (Google configurável)
- Middleware personalizado
- Maior controle e customização

### Fluxo de Auth
1. Usuário se cadastra → `auth.users` criado
2. Trigger executa → `profiles` criado automaticamente
3. Login → Session cookies gerenciados
4. Middleware → Valida em cada requisição

## 📦 Variáveis de Ambiente

### Antes
```env
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
(+ múltiplas CLERK_ vars)
```

### Depois
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Muito mais simples! ✨

## 🚀 Como Usar Agora

### 1. Configure o Supabase

```bash
# 1. Crie projeto em supabase.com
# 2. Execute supabase/schema.sql no SQL Editor
# 3. Copie URL e ANON_KEY para .env.local
```

### 2. Instale e Execute

```bash
npm install
npm run dev
```

### 3. Crie uma Conta

- Acesse `/signup`
- Email + Senha ou Google OAuth
- Confirme email (se configurado)
- Redirecionado para `/dashboard`

## 🔧 Configuração OAuth (Opcional)

No Supabase Dashboard:

1. **Authentication → Providers**
2. **Google**:
   - Ative o provider
   - Configure Client ID/Secret do Google Cloud
   - Salve

O botão "Continue com Google" já está implementado!

## 📊 Comparação de Features

| Feature | Neon + Drizzle + Clerk | Supabase | Status |
|---------|----------------------|----------|--------|
| Database PostgreSQL | ✅ | ✅ | ✅ |
| Type Safety | ✅ (Drizzle) | ✅ (Types gerados) | ✅ |
| Row Level Security | ⚠️ (manual) | ✅ (nativo) | ✅ |
| Auth Email/Password | ✅ | ✅ | ✅ |
| Auth OAuth | ✅ | ✅ | ✅ |
| Auth 2FA | ✅ | ✅ | 🔄 |
| Realtime | ❌ | ✅ | 🔮 |
| Storage | ❌ | ✅ | 🔮 |
| Edge Functions | ❌ | ✅ | 🔮 |
| Setup Complexity | 🔴 Alta | 🟢 Baixa | ✅ |
| Custo (Free Tier) | 🟡 Limitado | 🟢 Generoso | ✅ |

**Legenda**: ✅ Funcional | 🔄 Disponível mas não implementado | 🔮 Future use

## 💡 Melhorias Futuras Possíveis

Com Supabase, agora temos acesso a:

### 1. Realtime Subscriptions
```typescript
supabase
  .channel('transactions')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'transactions' },
    (payload) => {
      // Atualizar UI em tempo real
    }
  )
  .subscribe()
```

### 2. Storage para Imagens
```typescript
// Upload de recibos
const { data } = await supabase.storage
  .from('receipts')
  .upload(`${userId}/${filename}`, file)
```

### 3. Edge Functions
- Processar imagens no backend
- Webhooks customizados
- Scheduled jobs

## 🐛 Troubleshooting

### Erro de Auth
```
Error: Invalid JWT
```
**Solução**: Limpe cookies e faça login novamente

### Erro de RLS
```
Error: Row level security policy violation
```
**Solução**: Verifique se as policies foram criadas (schema.sql)

### Erro de Email Confirmation
**Solução**: No Supabase, desative "Email confirmations" em Auth settings (dev only)

## ✅ Checklist de Migração

- [x] Atualizar package.json
- [x] Remover dependências antigas
- [x] Instalar Supabase
- [x] Criar clientes Supabase (client/server)
- [x] Criar schema SQL
- [x] Reescrever Server Actions
- [x] Criar páginas de auth custom
- [x] Atualizar componentes
- [x] Atualizar middleware
- [x] Atualizar documentação
- [x] Testar autenticação
- [x] Testar CRUD de transações
- [x] Commit e push

## 📝 Notas Técnicas

### Supabase Client vs Server

**Client** (`lib/supabase/client.ts`):
- Usado em componentes client ('use client')
- Cookie handling automático no browser

**Server** (`lib/supabase/server.ts`):
- Usado em Server Components e Server Actions
- Gerencia cookies via Next.js cookies API

### Middleware

O middleware agora:
1. Verifica session em cada request
2. Redireciona não autenticados de rotas protegidas
3. Redireciona autenticados de auth pages
4. Atualiza session tokens automaticamente

## 🎉 Resultado Final

- ✅ **Código mais limpo** (menos dependências)
- ✅ **Setup mais rápido** (1 serviço ao invés de 3)
- ✅ **Custo menor** (free tier generoso)
- ✅ **Mais features** (Realtime, Storage, Edge Functions)
- ✅ **Melhor DX** (1 dashboard, docs excelentes)

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Migração concluída em**: 21/11/2024  
**Desenvolvido por**: BRANDUP HUB 💚

