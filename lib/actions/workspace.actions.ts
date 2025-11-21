'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export type CreateWorkspaceInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: WorkspaceType;
};

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>;

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

  // Buscar workspaces onde o usuário é membro
  const { data: memberWorkspaces, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;

  if (memberWorkspaces && memberWorkspaces.length > 0) {
    const memberWorkspaceIds = memberWorkspaces.map((wm) => wm.workspace_id);
    
    const { data: sharedWorkspaces, error: sharedError } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', memberWorkspaceIds)
      .neq('owner_id', user.id)
      .order('created_at', { ascending: true });

    if (sharedError) throw sharedError;

    return [...(ownedWorkspaces || []), ...(sharedWorkspaces || [])];
  }

  // Se não tem workspaces, criar um padrão
  if (!ownedWorkspaces || ownedWorkspaces.length === 0) {
    return await createDefaultWorkspace(supabase, user.id);
  }

  return ownedWorkspaces || [];
}

// ============================================================================
// CREATE DEFAULT WORKSPACE (Helper)
// ============================================================================

async function createDefaultWorkspace(supabase: any, userId: string): Promise<Workspace[]> {
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

    // Adicionar o usuário como owner
    await supabase.from('workspace_members').insert({
      workspace_id: newWorkspace.id,
      user_id: userId,
      role: 'owner',
      permissions: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_manage_members: true,
      },
    });

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

  // Validações
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Nome do workspace é obrigatório');
  }

  // Criar workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      owner_id: user.id,
      name: input.name.trim(),
      description: input.description || null,
      icon: input.icon || '💼',
      color: input.color || '#FFD100',
      type: input.type || 'personal',
      settings: {},
    })
    .select()
    .single();

  if (workspaceError) {
    console.error('Erro ao criar workspace:', workspaceError);
    throw new Error('Erro ao criar workspace');
  }

  // Adicionar o criador como owner do workspace
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
      permissions: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_manage_members: true,
      },
    });

  if (memberError) {
    console.error('Erro ao adicionar membro:', memberError);
    // Tentar deletar o workspace criado
    await supabase.from('workspaces').delete().eq('id', workspace.id);
    throw new Error('Erro ao configurar workspace');
  }

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

  // Verificar se o usuário é owner do workspace
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error('Workspace não encontrado');
  }

  if (workspace.owner_id !== user.id) {
    throw new Error('Apenas o owner pode editar o workspace');
  }

  // Atualizar workspace
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined) updateData.description = input.description;
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.type !== undefined) updateData.type = input.type;

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

  // Verificar se o usuário tem acesso ao workspace
  const hasAccess = await isWorkspaceMember(workspaceId, user.id);
  if (!hasAccess) {
    throw new Error('Sem permissão para acessar este workspace');
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar membros:', error);
    throw new Error('Erro ao buscar membros');
  }

  return data || [];
}

// ============================================================================
// HELPER: Check if user is workspace member
// ============================================================================

async function isWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  return !error && data !== null;
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

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data.role;
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

  // Contar membros
  const { count: membersCount } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  return {
    transactions: transactionsCount || 0,
    budgets: budgetsCount || 0,
    goals: goalsCount || 0,
    members: membersCount || 0,
  };
}

