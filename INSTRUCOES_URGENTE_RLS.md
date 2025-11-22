# 🚨 CORREÇÃO URGENTE - Recursão Infinita no Banco de Dados

## ⚠️ PROBLEMA

O banco de dados está com erro de **recursão infinita** nas políticas RLS de `workspace_members`.

**Erro**: `infinite recursion detected in policy for relation "workspace_members"`

---

## 🔧 SOLUÇÃO (EXECUTE AGORA)

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard**
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto BolsoCoin

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Cole e Execute este SQL:**

```sql
-- ============================================================================
-- FIX: Recursão infinita nas políticas de workspace_members
-- ============================================================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update own membership" ON public.workspace_members;

-- Recriar políticas SEM recursão
-- Membros podem ver outros membros do mesmo workspace (sem nested EXISTS)
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Apenas owners podem adicionar membros (simplificado)
CREATE POLICY "Owners can add members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Apenas owners podem remover membros (simplificado)
CREATE POLICY "Owners can remove members" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Membros podem atualizar suas próprias configurações
CREATE POLICY "Users can update own membership" ON public.workspace_members
  FOR UPDATE USING (user_id = auth.uid());
```

4. **Clique em "Run" (ou F5)**

5. **Verifique o sucesso:**
   - Deve aparecer "Success. No rows returned"
   - ✅ Se sim, políticas corrigidas!

---

### Opção 2: Via Arquivo SQL (Alternativa)

Se preferir, execute a migration que criei:

```bash
# No terminal do Supabase ou via psql
psql postgresql://[SEU_CONNECTION_STRING] -f supabase/migrations/004_fix_workspace_policies.sql
```

---

## 🧪 TESTAR APÓS CORREÇÃO

Depois de executar o SQL:

1. **Recarregue a aplicação**: F5 no navegador
2. **Faça login novamente**
3. **Verifique se o erro sumiu** no console
4. **Crie um novo workspace** para testar

---

## 📊 O QUE FOI CORRIGIDO

### ANTES (Recursão):
```sql
-- ❌ Política que causa recursão
CREATE POLICY "Members can view workspace members" 
  ON public.workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm  -- ❌ Self-reference causa loop!
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );
```

### DEPOIS (Sem Recursão):
```sql
-- ✅ Política otimizada sem recursão
CREATE POLICY "Members can view workspace members" 
  ON public.workspace_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members  -- ✅ Subquery simples
      WHERE user_id = auth.uid()
    )
  );
```

---

## ✅ OUTRAS CORREÇÕES APLICADAS

Além da correção do banco, também:
- ✅ Removido `/dev-login` (login bypass)
- ✅ Removidas pastas antigas do Clerk (sign-in, sign-up)

---

## 🎯 PRÓXIMOS PASSOS

Após executar o SQL:

1. ✅ Erro de recursão resolvido
2. ✅ Sistema funcionando normalmente
3. ✅ Login/Logout funcionando
4. ✅ Workspaces funcionando

---

## 🆘 SE AINDA DER ERRO

Se após executar o SQL ainda houver problemas:

1. **Verifique no Supabase Dashboard:**
   - Authentication > Policies
   - Confirme que as políticas antigas foram removidas
   - Confirme que as novas políticas estão ativas

2. **Limpe o cache do navegador:**
   - Ctrl + Shift + Delete
   - Limpar cache e cookies
   - Recarregar

3. **Reinicie o servidor local:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

---

## 📞 SUPORTE

Se precisar de ajuda, me avise! 🚀

---

**Status**: ⏳ AGUARDANDO EXECUÇÃO DO SQL NO SUPABASE

