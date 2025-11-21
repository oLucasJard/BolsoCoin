'use client';

import { useEffect, useState } from 'react';
import { migrateDataToWorkspaces } from '@/lib/actions/migration.actions';

/**
 * Componente que executa a migração automática uma única vez
 * Usa localStorage para evitar execuções repetidas
 */
export default function AutoMigration() {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const runMigration = async () => {
      // Verificar se já foi migrado
      const alreadyMigrated = localStorage.getItem('workspace-migrated');
      
      if (alreadyMigrated) {
        setMigrated(true);
        return;
      }

      try {
        console.log('[AutoMigration] Executando migração...');
        const result = await migrateDataToWorkspaces();
        
        if (result.success) {
          console.log('[AutoMigration] Migração concluída:', result.message);
          localStorage.setItem('workspace-migrated', 'true');
          setMigrated(true);
        } else {
          console.error('[AutoMigration] Falha na migração:', result.message);
        }
      } catch (error) {
        console.error('[AutoMigration] Erro durante migração:', error);
        // Não marca como migrado para tentar novamente depois
      }
    };

    runMigration();
  }, []);

  // Componente invisível - apenas executa a lógica
  return null;
}

