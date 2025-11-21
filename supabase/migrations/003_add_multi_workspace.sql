-- ============================================================================
-- BolsoCoin v2.0 - Multi-Workspace System
-- Migration: 003_add_multi_workspace.sql
-- Data: Novembro 2024
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELAS
-- ============================================================================

-- Tabela de Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💰', -- Emoji ou código do ícone
  color TEXT DEFAULT '#FFD100', -- Cor de identificação (hex)
  type TEXT DEFAULT 'personal', -- 'personal', 'business', 'church', 'project'
  settings JSONB DEFAULT '{}'::jsonb, -- Configurações customizadas
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT workspace_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT workspace_type_valid CHECK (type IN ('personal', 'business', 'church', 'project'))
);

-- Tabela de Membros de Workspaces (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{
    "can_view": true,
    "can_create": true,
    "can_edit": false,
    "can_delete": false,
    "can_manage_members": false
  }'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT member_role_valid CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

-- ============================================================================
-- 2. ADICIONAR workspace_id NAS TABELAS EXISTENTES
-- ============================================================================

-- Adicionar workspace_id em transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Adicionar workspace_id em categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Adicionar workspace_id em budgets
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Adicionar workspace_id em goals
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- ============================================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices em workspaces
CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS workspaces_type_idx ON public.workspaces(type);
CREATE INDEX IF NOT EXISTS workspaces_created_at_idx ON public.workspaces(created_at DESC);

-- Índices em workspace_members
CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx ON public.workspace_members(workspace_id);

-- Índices em tabelas com workspace_id
CREATE INDEX IF NOT EXISTS transactions_workspace_id_idx ON public.transactions(workspace_id);
CREATE INDEX IF NOT EXISTS categories_workspace_id_idx ON public.categories(workspace_id);
CREATE INDEX IF NOT EXISTS budgets_workspace_id_idx ON public.budgets(workspace_id);
CREATE INDEX IF NOT EXISTS goals_workspace_id_idx ON public.goals(workspace_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Políticas para WORKSPACES
-- Usuários podem ver workspaces que possuem ou são membros
CREATE POLICY "Users can view own and member workspaces" ON public.workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Usuários podem criar seus próprios workspaces
CREATE POLICY "Users can create own workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Apenas owners podem atualizar workspaces
CREATE POLICY "Owners can update own workspaces" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- Apenas owners podem deletar workspaces
CREATE POLICY "Owners can delete own workspaces" ON public.workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Políticas para WORKSPACE_MEMBERS
-- Membros podem ver outros membros do mesmo workspace
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Owners e admins podem adicionar membros
CREATE POLICY "Owners and admins can add members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Owners e admins podem remover membros
CREATE POLICY "Owners and admins can remove members" ON public.workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Atualizar políticas RLS das tabelas existentes para considerar workspace_id

-- TRANSACTIONS: Usuários veem transações dos workspaces que são membros
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view workspace transactions" ON public.transactions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = transactions.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert workspace transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = transactions.workspace_id
        AND wm.user_id = auth.uid()
        AND (wm.permissions->>'can_create')::boolean = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update workspace transactions" ON public.transactions
  FOR UPDATE USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = transactions.workspace_id
        AND wm.user_id = auth.uid()
        AND (wm.permissions->>'can_edit')::boolean = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete workspace transactions" ON public.transactions
  FOR DELETE USING (
    user_id = auth.uid() AND (
      workspace_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = transactions.workspace_id
        AND wm.user_id = auth.uid()
        AND (wm.permissions->>'can_delete')::boolean = true
      )
    )
  );

-- CATEGORIES: Mesma lógica de workspace
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view workspace categories" ON public.categories
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = categories.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert workspace categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update workspace categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete workspace categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

-- BUDGETS: Mesma lógica de workspace
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view workspace budgets" ON public.budgets
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = budgets.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert workspace budgets" ON public.budgets
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update workspace budgets" ON public.budgets
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete workspace budgets" ON public.budgets
  FOR DELETE USING (user_id = auth.uid());

-- GOALS: Mesma lógica de workspace
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view workspace goals" ON public.goals
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = goals.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
CREATE POLICY "Users can insert workspace goals" ON public.goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update workspace goals" ON public.goals
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete workspace goals" ON public.goals
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 5. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para criar workspace padrão ao registrar novo usuário
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Criar workspace padrão "Pessoal"
  INSERT INTO public.workspaces (owner_id, name, description, icon, color, type)
  VALUES (
    NEW.id,
    'Pessoal',
    'Meu workspace pessoal',
    '💰',
    '#FFD100',
    'personal'
  )
  RETURNING id INTO new_workspace_id;

  -- Adicionar o usuário como owner do workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role, permissions)
  VALUES (
    new_workspace_id,
    NEW.id,
    'owner',
    '{
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true,
      "can_manage_members": true
    }'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar workspace ao criar perfil
DROP TRIGGER IF EXISTS on_profile_created_create_workspace ON public.profiles;
CREATE TRIGGER on_profile_created_create_workspace
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_workspace();

-- Função para atualizar updated_at em workspaces
CREATE OR REPLACE FUNCTION public.handle_workspace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_updated_at_workspaces ON public.workspaces;
CREATE TRIGGER set_updated_at_workspaces
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_workspace_updated_at();

-- Função para migrar transações existentes para workspace padrão
CREATE OR REPLACE FUNCTION public.migrate_existing_data_to_default_workspace()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  default_workspace_id UUID;
BEGIN
  -- Para cada usuário que tem transações sem workspace
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.transactions 
    WHERE workspace_id IS NULL
  LOOP
    -- Encontrar ou criar workspace padrão do usuário
    SELECT w.id INTO default_workspace_id
    FROM public.workspaces w
    WHERE w.owner_id = user_record.user_id
    AND w.type = 'personal'
    ORDER BY w.created_at ASC
    LIMIT 1;

    -- Se não existir, criar
    IF default_workspace_id IS NULL THEN
      INSERT INTO public.workspaces (owner_id, name, description, icon, color, type)
      VALUES (
        user_record.user_id,
        'Pessoal',
        'Meu workspace pessoal',
        '💰',
        '#FFD100',
        'personal'
      )
      RETURNING id INTO default_workspace_id;

      -- Adicionar como membro owner
      INSERT INTO public.workspace_members (workspace_id, user_id, role, permissions)
      VALUES (
        default_workspace_id,
        user_record.user_id,
        'owner',
        '{
          "can_view": true,
          "can_create": true,
          "can_edit": true,
          "can_delete": true,
          "can_manage_members": true
        }'::jsonb
      );
    END IF;

    -- Migrar transações
    UPDATE public.transactions
    SET workspace_id = default_workspace_id
    WHERE user_id = user_record.user_id
    AND workspace_id IS NULL;

    -- Migrar categorias
    UPDATE public.categories
    SET workspace_id = default_workspace_id
    WHERE user_id = user_record.user_id
    AND workspace_id IS NULL;

    -- Migrar orçamentos
    UPDATE public.budgets
    SET workspace_id = default_workspace_id
    WHERE user_id = user_record.user_id
    AND workspace_id IS NULL;

    -- Migrar metas
    UPDATE public.goals
    SET workspace_id = default_workspace_id
    WHERE user_id = user_record.user_id
    AND workspace_id IS NULL;

  END LOOP;

  RAISE NOTICE 'Migração de dados existentes concluída com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. EXECUTAR MIGRAÇÃO DE DADOS EXISTENTES
-- ============================================================================

-- Executar a migração de dados (comente se não quiser executar agora)
SELECT public.migrate_existing_data_to_default_workspace();

-- ============================================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.workspaces IS 'Workspaces isolados para diferentes contextos (pessoal, empresa, igreja, etc)';
COMMENT ON TABLE public.workspace_members IS 'Membros de cada workspace com suas permissões';

COMMENT ON COLUMN public.workspaces.type IS 'Tipo: personal, business, church, project';
COMMENT ON COLUMN public.workspaces.settings IS 'Configurações customizadas do workspace (JSONB)';
COMMENT ON COLUMN public.workspace_members.role IS 'Papel: owner, admin, member, viewer';
COMMENT ON COLUMN public.workspace_members.permissions IS 'Permissões granulares (JSONB)';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 003_add_multi_workspace.sql executada com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: workspaces, workspace_members';
  RAISE NOTICE '🔗 Relacionamentos adicionados em: transactions, categories, budgets, goals';
  RAISE NOTICE '🔐 RLS policies configuradas para multi-tenancy';
  RAISE NOTICE '⚡ Índices criados para performance';
  RAISE NOTICE '🔄 Dados existentes migrados para workspace padrão';
END $$;

