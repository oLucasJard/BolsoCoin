import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-c6-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <WifiOff className="w-24 h-24 mx-auto text-c6-gray-600" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Você está offline
        </h1>
        
        <p className="text-c6-gray-400 mb-8">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>
        
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-c6-yellow text-c6-black font-bold rounded-c6-md hover:bg-c6-yellow-hover transition-all"
        >
          Tentar Novamente
        </Link>
      </div>
    </div>
  );
}

