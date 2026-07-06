import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-c6-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="font-display text-2xl font-bold mb-2">Você está offline</h1>
        <p className="text-c6-gray-400 mb-6">
          Sem conexão com a internet. Reconecte e tente novamente.
        </p>
        <Link href="/dashboard" className="btn-c6 inline-block">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
