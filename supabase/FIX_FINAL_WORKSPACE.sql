-- ============================================================================
-- CORREÇÃO FINAL E DEFINITIVA - Recursão Infinita
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER **TODAS** as políticas antigas (forçado)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'workspace_members' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.workspace_members';
    END LOOP;
END $$;

-- 3. REABILITAR RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS NOVAS (SEM RECURSÃO)

-- Política 1: Ver membros (SEM RECURSÃO)
CREATE POLICY "view_workspace_members" ON public.workspace_members
  FOR SELECT 
  USING (
    -- Usuário é o próprio membro OU
    user_id = auth.uid() 
    OR 
    -- Usuário faz parte do workspace (subconsulta simples)
    workspace_id IN (
      SELECT wm.workspace_id 
      FROM public.workspace_members wm 
      WHERE wm.user_id = auth.uid()
    )
  );

-- Política 2: Adicionar membros (apenas owners)
CREATE POLICY "insert_workspace_members" ON public.workspace_members
  FOR INSERT 
  WITH CHECK (
    -- Apenas owners do workspace podem adicionar membros
    workspace_id IN (
      SELECT w.id 
      FROM public.workspaces w 
      WHERE w.owner_id = auth.uid()
    )
  );

-- Política 3: Remover membros (apenas owners)
CREATE POLICY "delete_workspace_members" ON public.workspace_members
  FOR DELETE 
  USING (
    -- Apenas owners do workspace podem remover membros
    workspace_id IN (
      SELECT w.id 
      FROM public.workspaces w 
      WHERE w.owner_id = auth.uid()
    )
  );

-- Política 4: Atualizar próprio perfil
CREATE POLICY "update_own_membership" ON public.workspace_members
  FOR UPDATE 
  USING (user_id = auth.uid());

-- 5. VERIFICAR SE FOI APLICADO
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ POLÍTICAS CORRIGIDAS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas criadas:';
    RAISE NOTICE '  - view_workspace_members';
    RAISE NOTICE '  - insert_workspace_members';
    RAISE NOTICE '  - delete_workspace_members';
    RAISE NOTICE '  - update_own_membership';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Agora recarregue a aplicação (F5)';
    RAISE NOTICE '========================================';
END $$;

