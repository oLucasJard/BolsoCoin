import Navbar from '@/components/Navbar';
import { syncUser } from '@/lib/actions/user.actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

