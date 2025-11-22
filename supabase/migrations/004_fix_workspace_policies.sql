-- ============================================================================
-- FIX: Recursão infinita nas políticas de workspace_members
-- ============================================================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.workspace_members;

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

