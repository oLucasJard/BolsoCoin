import Navbar from '@/components/Navbar';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-c6-black">
      <Navbar />
      <main className="pb-20 sm:pb-8">
        {children}
      </main>
      <PWAInstallPrompt />
    </div>
  );
}
