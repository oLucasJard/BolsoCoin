import Navbar from '@/components/Navbar';

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
    </div>
  );
}
