-- ============================================================================
-- CORREÇÃO COMPLETA E DEFINITIVA - Recursão em workspace_members
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- PASSO 1: DESABILITAR TRIGGERS QUE CAUSAM RECURSÃO
-- ----------------------------------------------------------------------------

-- Desabilitar trigger que cria workspace_member automaticamente
DROP TRIGGER IF EXISTS on_profile_created_create_workspace ON public.profiles;

-- Desabilitar a função (mas mantê-la para referência futura)
-- DROP FUNCTION IF EXISTS public.create_default_workspace();


-- PASSO 2: REMOVER TODAS AS POLÍTICAS RECURSIVAS
-- ----------------------------------------------------------------------------

-- Remover políticas de workspace_members (CAUSA RAIZ DA RECURSÃO!)
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "view_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "insert_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "delete_workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "update_own_membership" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

-- Remover políticas de workspaces que fazem EXISTS em workspace_members
DROP POLICY IF EXISTS "Users can view own and member workspaces" ON public.workspaces;

-- Remover políticas de transactions que fazem EXISTS em workspace_members  
DROP POLICY IF EXISTS "Users can view workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update workspace transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete workspace transactions" ON public.transactions;

-- Remover políticas de categories que fazem EXISTS em workspace_members
DROP POLICY IF EXISTS "Users can view workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update workspace categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete workspace categories" ON public.categories;

-- Remover políticas de budgets que fazem EXISTS em workspace_members
DROP POLICY IF EXISTS "Users can view workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update workspace budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete workspace budgets" ON public.budgets;

-- Remover políticas de goals que fazem EXISTS em workspace_members
DROP POLICY IF EXISTS "Users can view workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update workspace goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete workspace goals" ON public.goals;


-- PASSO 3: CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO)
-- ----------------------------------------------------------------------------

-- ============
-- WORKSPACES
-- ============

-- Ver apenas workspaces que você é owner (SEM verificar workspace_members)
CREATE POLICY "workspaces_select_owner" ON public.workspaces
  FOR SELECT 
  USING (owner_id = auth.uid());

-- Criar apenas workspaces onde você é owner
CREATE POLICY "workspaces_insert_owner" ON public.workspaces
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

-- Atualizar apenas seus workspaces
CREATE POLICY "workspaces_update_owner" ON public.workspaces
  FOR UPDATE 
  USING (owner_id = auth.uid());

-- Deletar apenas seus workspaces
CREATE POLICY "workspaces_delete_owner" ON public.workspaces
  FOR DELETE 
  USING (owner_id = auth.uid());


-- ============
-- WORKSPACE_MEMBERS (DESABILITADO TEMPORARIAMENTE)
-- ============

-- DESABILITAR RLS completamente em workspace_members
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;


-- ============
-- TRANSACTIONS
-- ============

-- Ver transações onde você é o user_id E (workspace_id é null OU você é owner do workspace)
CREATE POLICY "transactions_select_simple" ON public.transactions
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

-- Criar transações onde você é user_id E (workspace_id é null OU você é owner do workspace)
CREATE POLICY "transactions_insert_simple" ON public.transactions
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

-- Atualizar transações onde você é user_id E (workspace_id é null OU você é owner do workspace)
CREATE POLICY "transactions_update_simple" ON public.transactions
  FOR UPDATE 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

-- Deletar transações onde você é user_id E (workspace_id é null OU você é owner do workspace)
CREATE POLICY "transactions_delete_simple" ON public.transactions
  FOR DELETE 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = transactions.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );


-- ============
-- CATEGORIES
-- ============

CREATE POLICY "categories_select_simple" ON public.categories
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = categories.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "categories_insert_simple" ON public.categories
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update_simple" ON public.categories
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "categories_delete_simple" ON public.categories
  FOR DELETE 
  USING (user_id = auth.uid());


-- ============
-- BUDGETS
-- ============

CREATE POLICY "budgets_select_simple" ON public.budgets
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = budgets.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "budgets_insert_simple" ON public.budgets
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "budgets_update_simple" ON public.budgets
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "budgets_delete_simple" ON public.budgets
  FOR DELETE 
  USING (user_id = auth.uid());


-- ============
-- GOALS
-- ============

CREATE POLICY "goals_select_simple" ON public.goals
  FOR SELECT 
  USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = goals.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "goals_insert_simple" ON public.goals
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_simple" ON public.goals
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "goals_delete_simple" ON public.goals
  FOR DELETE 
  USING (user_id = auth.uid());


-- PASSO 4: VERIFICAÇÃO FINAL
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE '✅ TODAS AS POLÍTICAS RECURSIVAS FORAM REMOVIDAS!';
  RAISE NOTICE '✅ NOVAS POLÍTICAS SIMPLES CRIADAS (apenas owner_id)';
  RAISE NOTICE '✅ workspace_members RLS DESABILITADO';
  RAISE NOTICE '✅ TRIGGER de criação automática DESABILITADO';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 SISTEMA AGORA FUNCIONA APENAS COM OWNERS';
  RAISE NOTICE '📝 Para reimplementar multi-usuário, use PostgreSQL Functions';
END $$;

-- ============================================================================
-- FIM DA CORREÇÃO
-- ============================================================================

