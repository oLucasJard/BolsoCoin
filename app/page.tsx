import Link from 'next/link';
import { Sparkles, Zap, TrendingUp, Mic, Camera, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-c6-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-c6-yellow/10 to-transparent" />
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-c6-yellow rounded-full mb-6">
              <span className="text-4xl sm:text-5xl">💰</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Bolso<span className="text-c6-yellow">Coin</span>
            </h1>
            <p className="text-lg sm:text-xl text-c6-gray-300 max-w-2xl mx-auto px-4">
              Controle financeiro pessoal integrado com planilha Excel
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
            <Link href="/dashboard" className="btn-c6 w-full sm:w-auto text-center text-lg sm:text-base">
              Começar Agora
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <FileSpreadsheet className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">Planilha Integrada</h3>
              <p className="text-sm sm:text-base text-c6-gray-400">Tudo sincronizado com Excel em tempo real</p>
            </div>
            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <Sparkles className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">IA Poderosa</h3>
              <p className="text-sm sm:text-base text-c6-gray-400">Entrada de dados por texto, voz ou foto</p>
            </div>
            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <Zap className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">Ultra Rápido</h3>
              <p className="text-sm sm:text-base text-c6-gray-400">Registre em segundos sem complicação</p>
            </div>
            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <TrendingUp className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">Controle Total</h3>
              <p className="text-sm sm:text-base text-c6-gray-400">Cartões, investimentos, reservas e mais</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 sm:py-24 bg-c6-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">
            Como <span className="text-c6-yellow">Funciona</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <Mic className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">1. Fale ou Digite</h3>
              <p className="text-c6-gray-400">&quot;Comprei café 15 reais&quot; - simples assim!</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <Sparkles className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">2. IA Processa</h3>
              <p className="text-c6-gray-400">Extrai valor, categoria e fornecedor automaticamente</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <FileSpreadsheet className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">3. Salva na Planilha</h3>
              <p className="text-c6-gray-400">Dados sincronizados com seu Excel automaticamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-16 sm:py-20 bg-gradient-to-b from-transparent to-c6-yellow/10">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Pronto para <span className="text-c6-yellow">Começar</span>?
          </h2>
          <Link href="/dashboard" className="btn-c6 inline-block text-lg">
            Ir para o Dashboard
          </Link>
        </div>
      </div>

      <footer className="py-8 border-t border-c6-gray-800">
        <div className="container mx-auto px-4 sm:px-6 text-center text-c6-gray-500 text-sm">
          <p>© 2025 BolsoCoin - Suas finanças na planilha</p>
        </div>
      </footer>
    </main>
  );
}
