'use client';

import { useEffect, useState } from 'react';
import { migrateDataToWorkspaces } from '@/lib/actions/migration.actions';

/**
 * Componente que executa a migração automática uma única vez
 * Usa localStorage para evitar execuções repetidas
 * OTIMIZADO: Não bloqueia a interface, executa em background
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

      // Executar em background sem bloquear (requestIdleCallback se disponível)
      const runInBackground = () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            await performMigration();
          });
        } else {
          // Fallback: setTimeout mínimo
          setTimeout(async () => {
            await performMigration();
          }, 100);
        }
      };

      const performMigration = async () => {
        try {
          const result = await migrateDataToWorkspaces();
          
          if (result.success) {
            localStorage.setItem('workspace-migrated', 'true');
            setMigrated(true);
            // Recarregar apenas se migrou dados
            if (result.message.includes('migrados')) {
              window.location.reload();
            }
          } else {
            // Se falhar, marca para não tentar novamente
            if (result.message.includes('não autenticado') || result.message.includes('workspaces existentes')) {
              localStorage.setItem('workspace-skip-migration', 'true');
            }
          }
        } catch (error) {
          // Marca para pular se der erro (provavelmente usuário novo)
          localStorage.setItem('workspace-skip-migration', 'true');
        }
      };

      runInBackground();
    };

    runMigration();
  }, []);

  // Componente invisível - apenas executa a lógica
  return null;
}

