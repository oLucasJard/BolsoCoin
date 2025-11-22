'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Migra dados existentes para o sistema de workspaces
 * 
 * Esta função:
 * 1. Cria um workspace "Pessoal" padrão se o usuário não tiver nenhum
 * 2. Atribui todas as transações, orçamentos e metas sem workspace_id ao workspace padrão
 */
export async function migrateDataToWorkspaces(): Promise<{
  success: boolean;
  message: string;
  workspaceId?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Usuário não autenticado',
    };
  }

  try {
    // 1. Verificar se o usuário já tem workspaces
    const { data: existingWorkspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (workspacesError) {
      console.error('Erro ao verificar workspaces:', workspacesError);
      return {
        success: false,
        message: 'Erro ao verificar workspaces existentes',
      };
    }

    let defaultWorkspaceId: string;

    // 2. Se não tem workspace, criar um padrão
    if (!existingWorkspaces || existingWorkspaces.length === 0) {
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
          owner_id: user.id,
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
        return {
          success: false,
          message: 'Erro ao criar workspace padrão',
        };
      }

      // TEMPORÁRIO: Comentado para evitar recursão no RLS
      // A verificação de ownership é feita pela coluna owner_id na tabela workspaces
      // TODO: Reimplementar quando as políticas RLS estiverem estáveis
      
      // const { error: memberError } = await supabase
      //   .from('workspace_members')
      //   .insert({
      //     workspace_id: newWorkspace.id,
      //     user_id: user.id,
      //     role: 'owner',
      //     permissions: { can_view: true, can_create: true, can_edit: true, can_delete: true, can_manage_members: true },
      //   });

      // if (memberError) {
      //   console.error('Erro ao adicionar membro:', memberError);
      //   return { success: false, message: 'Erro ao configurar workspace padrão' };
      // }

      defaultWorkspaceId = newWorkspace.id;
    } else {
      defaultWorkspaceId = existingWorkspaces[0].id;
    }

    // 3. Migrar transações sem workspace_id
    const { data: transactionsToMigrate, error: txFetchError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .is('workspace_id', null);

    if (txFetchError) {
      console.error('Erro ao buscar transações:', txFetchError);
    } else if (transactionsToMigrate && transactionsToMigrate.length > 0) {
      const { error: txUpdateError } = await supabase
        .from('transactions')
        .update({ workspace_id: defaultWorkspaceId })
        .eq('user_id', user.id)
        .is('workspace_id', null);

      if (txUpdateError) {
        console.error('Erro ao migrar transações:', txUpdateError);
      }
    }

    // 4. Migrar orçamentos sem workspace_id
    const { data: budgetsToMigrate, error: budgetFetchError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .is('workspace_id', null);

    if (budgetFetchError) {
      console.error('Erro ao buscar orçamentos:', budgetFetchError);
    } else if (budgetsToMigrate && budgetsToMigrate.length > 0) {
      const { error: budgetUpdateError } = await supabase
        .from('budgets')
        .update({ workspace_id: defaultWorkspaceId })
        .eq('user_id', user.id)
        .is('workspace_id', null);

      if (budgetUpdateError) {
        console.error('Erro ao migrar orçamentos:', budgetUpdateError);
      }
    }

    // 5. Migrar metas sem workspace_id
    const { data: goalsToMigrate, error: goalFetchError } = await supabase
      .from('goals')
      .select('id')
      .eq('user_id', user.id)
      .is('workspace_id', null);

    if (goalFetchError) {
      console.error('Erro ao buscar metas:', goalFetchError);
    } else if (goalsToMigrate && goalsToMigrate.length > 0) {
      const { error: goalUpdateError } = await supabase
        .from('goals')
        .update({ workspace_id: defaultWorkspaceId })
        .eq('user_id', user.id)
        .is('workspace_id', null);

      if (goalUpdateError) {
        console.error('Erro ao migrar metas:', goalUpdateError);
      }
    }

    return {
      success: true,
      message: 'Dados migrados com sucesso!',
      workspaceId: defaultWorkspaceId,
    };
  } catch (error) {
    console.error('Erro durante migração:', error);
    return {
      success: false,
      message: 'Erro inesperado durante a migração',
    };
  }
}

