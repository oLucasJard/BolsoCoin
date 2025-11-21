import Navbar from '@/components/Navbar';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import AutoMigration from '@/components/AutoMigration';
import { getWorkspaces } from '@/lib/actions/workspace.actions';
import WorkspaceLoader from '@/components/WorkspaceLoader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let workspaces = [];
  
  try {
    workspaces = await getWorkspaces();
  } catch (error) {
    console.error('Erro ao carregar workspaces:', error);
    // Continua mesmo se falhar - o usuário será redirecionado pelo middleware se não estiver autenticado
  }

  return (
    <div className="min-h-screen bg-c6-black">
      <Navbar />
      <WorkspaceLoader initialWorkspaces={workspaces} />
      <AutoMigration />
      
      {/* Workspace Switcher */}
      {workspaces.length > 0 && (
        <div className="sticky top-16 sm:top-16 z-40 bg-c6-black border-b border-c6-gray-800 px-4 py-3">
          <WorkspaceSwitcher />
        </div>
      )}

      <main className="pb-20 sm:pb-8">
        {children}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
