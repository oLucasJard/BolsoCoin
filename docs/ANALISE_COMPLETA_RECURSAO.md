# 🔍 ANÁLISE COMPLETA - Recursão Infinita no Sistema

**Data**: 22 de Novembro de 2024  
**Análise**: Varredura completa de todo o sistema  
**Status**: 🚨 PROBLEMA IDENTIFICADO EM 3 CAMADAS

---

## 🎯 RESUMO EXECUTIVO

O erro `infinite recursion detected in policy for relation "workspace_members"` ocorre em **3 CAMADAS DIFERENTES**:

1. **BANCO DE DADOS** (Supabase RLS Policies) ❌
2. **BACKEND** (Server Actions) ❌  
3. **TRIGGER AUTOMÁTICO** (PostgreSQL) ❌

---

## 📊 CAMADA 1: BANCO DE DADOS (CAUSA RAIZ)

### Arquivo: `supabase/migrations/003_add_multi_workspace.sql`

#### ❌ PROBLEMA 1: Política de SELECT recursiva (linhas 121-128)

```sql
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm  -- ❌ CONSULTA workspace_members
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );
```

**Por que causa recursão:**
1. User tenta SELECT em `workspace_members`
2. RLS verifica: "você é membro?"
3. Para verificar, faz SELECT em `workspace_members` (linha 124)
4. RLS verifica novamente: "você é membro?"
5. **LOOP INFINITO!** 💥

---

#### ❌ PROBLEMA 2: Política de INSERT recursiva (linhas 131-139)

```sql
CREATE POLICY "Owners and admins can add members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm  -- ❌ CONSULTA workspace_members
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );
```

**Por que causa recursão:**
1. Código tenta INSERT em `workspace_members`
2. RLS verifica: "você é owner/admin?"
3. Para verificar, faz SELECT em `workspace_members` (linha 134)
4. RLS do SELECT verifica: "você é membro?"
5. Para verificar, faz SELECT em `workspace_members` novamente
6. **LOOP INFINITO!** 💥

---

#### ❌ PROBLEMA 3: Política de DELETE recursiva (linhas 142-150)

```sql
CREATE POLICY "Owners and admins can remove members" ON public.workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm  -- ❌ CONSULTA workspace_members
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );
```

**Mesmo problema de recursão!**

---

#### ❌ PROBLEMA 4: TODAS as tabelas verificam workspace_members

**Transactions** (linhas 154-206):
```sql
CREATE POLICY "Users can view workspace transactions" ON public.transactions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm  -- ❌ RECURSÃO!
      WHERE wm.workspace_id = transactions.workspace_id
      AND wm.user_id = auth.uid()
    )
  );
```

**Categories** (linhas 208-230)  
**Budgets** (linhas 232-254)  
**Goals** (linhas 256-278)

**TODAS** fazem EXISTS verificando `workspace_members`!

---

#### ❌ PROBLEMA 5: TRIGGER automático (linhas 285-326)

```sql
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Criar workspace padrão
  INSERT INTO public.workspaces (owner_id, name, ...)
  VALUES (NEW.id, 'Pessoal', ...)
  RETURNING id INTO new_workspace_id;

  -- ❌ FAZ INSERT EM workspace_members AUTOMATICAMENTE!
  INSERT INTO public.workspace_members (workspace_id, user_id, role, permissions)
  VALUES (
    new_workspace_id,
    NEW.id,
    'owner',
    '{...}'::jsonb
  );  -- CAUSA RECURSÃO NA POLÍTICA DE INSERT!

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa automaticamente
CREATE TRIGGER on_profile_created_create_workspace
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_workspace();
```

**Por que causa recursão:**
- Quando um novo user se registra → trigger executa
- Trigger faz INSERT em `workspace_members`
- Aciona política RLS de INSERT
- Política verifica `workspace_members`
- **LOOP INFINITO!** 💥

---

## 📊 CAMADA 2: CÓDIGO BACKEND

### Já CORRIGIDO ✅ (nas mensagens anteriores)

- ✅ `lib/actions/workspace.actions.ts` - Comentados INSERTs
- ✅ `lib/actions/transaction.actions.ts` - Removidos SELECTs
- ✅ `lib/actions/budget.actions.ts` - Removidos SELECTs
- ✅ `lib/actions/migration.actions.ts` - Comentado INSERT

---

## 📊 CAMADA 3: WORKSPACES POLICY

### Arquivo: `supabase/migrations/003_add_multi_workspace.sql` (linhas 97-105)

```sql
CREATE POLICY "Users can view own and member workspaces" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members  -- ❌ RECURSÃO!
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );
```

**Por que causa recursão:**
- User tenta ver workspaces → aciona esta política
- Política verifica `workspace_members`
- Aciona política de `workspace_members`
- **LOOP!** 💥

---

## ✅ SOLUÇÃO DEFINITIVA

### O QUE FAZER AGORA:

1. **EXECUTE o SQL** `supabase/FIX_ALL_RLS_RECURSION.sql` no Supabase SQL Editor
   - Remove TODAS as políticas recursivas
   - Cria novas políticas SEM recursão
   - Desabilita RLS em `workspace_members`
   - Desabilita TRIGGER automático

2. **NÃO** precisa mudar mais nada no código (já está corrigido)

3. **Sistema funcionará** apenas com OWNERS (sem compartilhamento)

---

## 🎯 ARQUITETURA FINAL (SEM RECURSÃO)

### ANTES (com recursão):
```
User → Workspaces
        ↓ (RLS check)
        workspace_members ← verifica workspace_members (LOOP!)
```

### DEPOIS (sem recursão):
```
User → Workspaces
        ↓ (RLS check)
        workspace.owner_id === auth.uid() ✅ (direto, sem loop)
```

---

## 📋 CHECKLIST DE CORREÇÃO

- [ ] **EXECUTAR** `FIX_ALL_RLS_RECURSION.sql` no Supabase
- [ ] **REINICIAR** o servidor Next.js
- [ ] **TESTAR** login
- [ ] **TESTAR** dashboard
- [ ] **TESTAR** criar transação
- [ ] **TESTAR** criar meta

---

## 🚨 PONTOS DE RECURSÃO ENCONTRADOS

| Localização | Tipo | Linha | Status |
|-------------|------|-------|--------|
| `workspace_members` SELECT policy | RLS | 121-128 | ❌ NO BANCO |
| `workspace_members` INSERT policy | RLS | 131-139 | ❌ NO BANCO |
| `workspace_members` DELETE policy | RLS | 142-150 | ❌ NO BANCO |
| `workspaces` SELECT policy | RLS | 97-105 | ❌ NO BANCO |
| `transactions` policies | RLS | 154-206 | ❌ NO BANCO |
| `categories` policies | RLS | 208-230 | ❌ NO BANCO |
| `budgets` policies | RLS | 232-254 | ❌ NO BANCO |
| `goals` policies | RLS | 256-278 | ❌ NO BANCO |
| `create_default_workspace()` trigger | Function | 285-326 | ❌ NO BANCO |
| `workspace.actions.ts` INSERT | Code | 112, 213 | ✅ CORRIGIDO |
| `transaction.actions.ts` SELECT | Code | Várias | ✅ CORRIGIDO |
| `budget.actions.ts` SELECT | Code | Várias | ✅ CORRIGIDO |

---

## 🎯 CONCLUSÃO

**O problema NÃO era apenas no código, mas principalmente no BANCO DE DADOS!**

- ❌ 9 políticas RLS recursivas
- ❌ 1 trigger automático recursivo  
- ❌ Afeta TODAS as tabelas do sistema

**SOLUÇÃO:** Executar o SQL de correção no Supabase!

---

**PRÓXIMO PASSO:** Executar `FIX_ALL_RLS_RECURSION.sql` no Supabase SQL Editor

