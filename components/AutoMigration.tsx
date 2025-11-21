'use client';

import { useEffect, useState } from 'react';
import { migrateDataToWorkspaces } from '@/lib/actions/migration.actions';

/**
 * Componente que executa a migração automática uma única vez
 * Usa localStorage para evitar execuções repetidas
 * NOTA: Só executa se usuário já tiver workspace (não bloqueia login)
 */
export default function AutoMigration() {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const runMigration = async () => {
      // Verificar se já foi migrado ou se deve pular
      const alreadyMigrated = localStorage.getItem('workspace-migrated');
      const skipMigration = localStorage.getItem('workspace-skip-migration');
      
      if (alreadyMigrated || skipMigration) {
        setMigrated(true);
        return;
      }

      // Aguardar 2 segundos para garantir que tudo carregou
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        console.log('[AutoMigration] Executando migração...');
        const result = await migrateDataToWorkspaces();
        
        if (result.success) {
          console.log('[AutoMigration] Migração concluída:', result.message);
          localStorage.setItem('workspace-migrated', 'true');
          setMigrated(true);
          
          // Recarregar workspaces
          window.location.reload();
        } else {
          console.log('[AutoMigration] Pulando migração:', result.message);
          // Se falhar, marca para não tentar novamente (usuário novo)
          if (result.message.includes('não autenticado') || result.message.includes('workspaces existentes')) {
            localStorage.setItem('workspace-skip-migration', 'true');
          }
        }
      } catch (error) {
        console.error('[AutoMigration] Erro durante migração:', error);
        // Marca para pular se der erro (provavelmente usuário novo)
        localStorage.setItem('workspace-skip-migration', 'true');
      }
    };

    runMigration();
  }, []);

  // Componente invisível - apenas executa a lógica
  return null;
}

