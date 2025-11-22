'use server';

import { createClient } from '@/lib/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { 
  createWorkspaceSchema, 
  updateWorkspaceSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput
} from '@/lib/validations/schemas';

// Types
export type WorkspaceType = 'personal' | 'business' | 'church' | 'project';

export type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  type: WorkspaceType;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_manage_members: boolean;
  };
  joined_at: string;
};

// Re-export types from schemas
export type { CreateWorkspaceInput, UpdateWorkspaceInput };

// ============================================================================
// GET WORKSPACES
// ============================================================================

export async function getWorkspaces(): Promise<Workspace[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Buscar workspaces onde o usuário é owner
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (ownedError) {
    console.error('Erro ao buscar workspaces:', ownedError);
    // Se falhar, criar workspace padrão
    return await createDefaultWorkspace(supabase, user.id);
  }

  // Se não tem workspaces, criar um padrão
  if (!ownedWorkspaces || ownedWorkspaces.length === 0) {
    return await createDefaultWorkspace(supabase, user.id);
  }

  // NOTA: Por enquanto, retornamos apenas workspaces owned
  // Para implementar workspaces compartilhados, precisaremos de uma solução diferente
  // para evitar recursão no RLS
  return ownedWorkspaces || [];
}

// ============================================================================
// CREATE DEFAULT WORKSPACE (Helper)
// ============================================================================

async function createDefaultWorkspace(supabase: SupabaseClient, userId: string): Promise<Workspace[]> {
  try {
    // Criar workspace padrão
    const { data: newWorkspace, error: createError } = await supabase
      .from('workspaces')
      .insert({
        owner_id: userId,
        name: 'Pessoal',
        description: 'Workspace padrão para suas finanças pessoais',
        icon: '💰',
        color: '#FFD100',
        type: 'personal',
        settings: {},
      })
      .select()
      .single();

    if (createError || !newWorkspace) {
      console.error('Erro ao criar workspace padrão:', createError);
      return [];
    }

    // TEMPORÁRIO: Comentado para evitar recursão no RLS
    // A verificação de ownership é feita pela coluna owner_id na tabela workspaces
    // TODO: Reimplementar quando as políticas RLS estiverem estáveis
    
    // const { error: memberError } = await supabase.from('workspace_members').insert({
    //   workspace_id: newWorkspace.id,
    //   user_id: userId,
    //   role: 'owner',
    //   permissions: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_manage_members: true },
    // });

    return [newWorkspace];
  } catch (error) {
    console.error('Erro ao criar workspace padrão:', error);
    return [];
  }
}

// ============================================================================
// GET WORKSPACE BY ID
// ============================================================================

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    console.error('Erro ao buscar workspace:', error);
    return null;
  }

  // Verificar se o usuário tem acesso ao workspace
  const hasAccess =
    data.owner_id === user.id ||
    (await isWorkspaceMember(workspaceId, user.id));

  if (!hasAccess) {
    throw new Error('Sem permissão para acessar este workspace');
  }

  return data;
}

// ============================================================================
// CREATE WORKSPACE
// ============================================================================

export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<Workspace> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar dados com Zod
  const validatedData = createWorkspaceSchema.parse(input);

  // Criar workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      owner_id: user.id,
      name: validatedData.name,
      description: validatedData.description || null,
      icon: validatedData.icon || '💼',
      color: validatedData.color || '#FFD100',
      type: validatedData.type || 'personal',
      settings: {},
    })
    .select()
    .single();

  if (workspaceError) {
    console.error('Erro ao criar workspace:', workspaceError);
    throw new Error('Erro ao criar workspace');
  }

  // TEMPORÁRIO: Comentado para evitar recursão no RLS
  // A verificação de ownership é feita pela coluna owner_id na tabela workspaces
  // TODO: Reimplementar quando as políticas RLS estiverem estáveis
  
  // const { error: memberError } = await supabase
  //   .from('workspace_members')
  //   .insert({
  //     workspace_id: workspace.id,
  //     user_id: user.id,
  //     role: 'owner',
  //     permissions: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_manage_members: true },
  //   });

  // if (memberError) {
  //   console.error('Erro ao adicionar membro:', memberError);
  //   await supabase.from('workspaces').delete().eq('id', workspace.id);
  //   throw new Error('Erro ao configurar workspace');
  // }

  revalidatePath('/dashboard');
  revalidatePath('/');

  return workspace;
}

// ============================================================================
// UPDATE WORKSPACE
// ============================================================================

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Validar dados com Zod
  const validatedData = updateWorkspaceSchema.parse(input);

  // Verificar se o usuário é owner do workspace
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error('Workspace não encontrado');
  }

  if (workspace.owner_id !== user.id) {
    throw new Error('Apenas o owner pode editar o workspace');
  }

  // Atualizar workspace
  const updateData: Record<string, any> = {};
  if (validatedData.name !== undefined) updateData.name = validatedData.name;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.icon !== undefined) updateData.icon = validatedData.icon;
  if (validatedData.color !== undefined) updateData.color = validatedData.color;
  if (validatedData.type !== undefined) updateData.type = validatedData.type;

  const { data, error } = await supabase
    .from('workspaces')
    .update(updateData)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar workspace:', error);
    throw new Error('Erro ao atualizar workspace');
  }

  revalidatePath('/dashboard');
  revalidatePath('/');

  return data;
}

// ============================================================================
// DELETE WORKSPACE
// ============================================================================

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Verificar se o usuário é owner do workspace
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error('Workspace não encontrado');
  }

  if (workspace.owner_id !== user.id) {
    throw new Error('Apenas o owner pode deletar o workspace');
  }

  // Verificar se tem dados (transações, etc)
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('id')
    .eq('workspace_id', workspaceId)
    .limit(1);

  if (txError) {
    console.error('Erro ao verificar transações:', txError);
    throw new Error('Erro ao verificar dados do workspace');
  }

  if (transactions && transactions.length > 0) {
    throw new Error(
      'Não é possível deletar workspace com transações. Mova ou delete as transações primeiro.'
    );
  }

  // Deletar workspace (CASCADE vai deletar members automaticamente)
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) {
    console.error('Erro ao deletar workspace:', error);
    throw new Error('Erro ao deletar workspace');
  }

  revalidatePath('/dashboard');
  revalidatePath('/');
}

// ============================================================================
// GET WORKSPACE MEMBERS
// ============================================================================

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // TEMPORÁRIO: Retornar vazio para evitar recursão no RLS
  // TODO: Reimplementar quando as políticas RLS estiverem estáveis
  console.warn('getWorkspaceMembers desabilitado temporariamente');
  return [];
}

// ============================================================================
// HELPER: Check if user is workspace member
// ============================================================================

async function isWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Simplificado: verificar apenas se é owner do workspace
  // Para evitar recursão no RLS ao consultar workspace_members
  const { data, error } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (error || !data) return false;
  
  // Retorna true se for owner
  return data.owner_id === userId;
}

// ============================================================================
// GET USER ROLE IN WORKSPACE
// ============================================================================

export async function getUserWorkspaceRole(
  workspaceId: string
): Promise<'owner' | 'admin' | 'member' | 'viewer' | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    return null;
  }

  // Simplificado: verificar se é owner do workspace
  const { data, error } = await supabase
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .single();

  if (error || !data) return null;

  // Se for owner, retorna 'owner', senão null
  return data.owner_id === user.id ? 'owner' : null;
}

// ============================================================================
// GET WORKSPACE STATS
// ============================================================================

export async function getWorkspaceStats(workspaceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  // Validar workspace ID
  if (!workspaceId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
    throw new Error('ID do workspace inválido');
  }

  // Verificar acesso
  const hasAccess = await isWorkspaceMember(workspaceId, user.id);
  if (!hasAccess) {
    throw new Error('Sem permissão para acessar este workspace');
  }

  // Contar transações
  const { count: transactionsCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  // Contar orçamentos
  const { count: budgetsCount } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  // Contar metas
  const { count: goalsCount } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  // TEMPORÁRIO: Retornar 1 membro para evitar recursão
  // TODO: Reimplementar quando as políticas RLS estiverem estáveis
  const membersCount = 1;

  return {
    transactions: transactionsCount || 0,
    budgets: budgetsCount || 0,
    goals: goalsCount || 0,
    members: membersCount,
  };
}

