import Link from 'next/link';
import { Sparkles, Zap, Shield, TrendingUp, Mic, Camera } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-c6-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-c6-yellow/10 to-transparent" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Logo/Brand */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-c6-yellow rounded-full mb-6">
              <span className="text-4xl sm:text-5xl">💰</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Bolso<span className="text-c6-yellow">Coin</span>
            </h1>
            <p className="text-lg sm:text-xl text-c6-gray-300 max-w-2xl mx-auto px-4">
              Gerenciamento financeiro inteligente com IA
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4">
            <Link
              href="/signup"
              className="btn-c6 w-full sm:w-auto text-center text-lg sm:text-base"
            >
              Começar Agora
            </Link>
            <Link
              href="/login"
              className="btn-c6-outline w-full sm:w-auto text-center text-lg sm:text-base"
            >
              Entrar
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <Sparkles className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">
                IA Poderosa
              </h3>
              <p className="text-sm sm:text-base text-c6-gray-400">
                Adicione transações por texto, voz ou foto
              </p>
            </div>

            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <Zap className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">
                Ultra Rápido
              </h3>
              <p className="text-sm sm:text-base text-c6-gray-400">
                Registre em segundos sem formulários chatos
              </p>
            </div>

            <div className="card-c6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-c6-yellow/20 rounded-full mb-4">
                <Shield className="text-c6-yellow" size={24} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2">
                100% Seguro
              </h3>
              <p className="text-sm sm:text-base text-c6-gray-400">
                Seus dados protegidos com criptografia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24 bg-c6-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">
            Como <span className="text-c6-yellow">Funciona</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <Mic className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">1. Fale ou Digite</h3>
              <p className="text-c6-gray-400">
                &quot;Comprei café 15 reais&quot; - simples assim!
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <Sparkles className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">2. IA Processa</h3>
              <p className="text-c6-gray-400">
                Extrai valor, categoria e fornecedor automaticamente
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-c6-yellow rounded-full flex items-center justify-center mb-6 shadow-c6-yellow">
                <TrendingUp className="text-c6-black" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">3. Acompanhe</h3>
              <p className="text-c6-gray-400">
                Veja gráficos, metas e orçamentos em tempo real
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-12 sm:space-y-16">
            {/* Feature 1 */}
            <div className="card-c6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-c6-yellow/20 rounded-c6-sm flex items-center justify-center">
                  <Mic className="text-c6-yellow" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Input por Voz</h3>
                  <p className="text-c6-gray-400 mb-4">
                    Grave um áudio falando a transação e deixe a IA fazer o resto.
                  </p>
                  <div className="inline-flex items-center text-c6-yellow text-sm font-semibold">
                    Powered by Whisper AI →
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-c6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-c6-yellow/20 rounded-c6-sm flex items-center justify-center">
                  <Camera className="text-c6-yellow" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Foto de Recibo</h3>
                  <p className="text-c6-gray-400 mb-4">
                    Tire uma foto do cupom fiscal e a IA extrai todas as informações.
                  </p>
                  <div className="inline-flex items-center text-c6-yellow text-sm font-semibold">
                    Powered by GPT-4 Vision →
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-c6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-c6-yellow/20 rounded-c6-sm flex items-center justify-center">
                  <TrendingUp className="text-c6-yellow" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">Metas e Orçamentos</h3>
                  <p className="text-c6-gray-400 mb-4">
                    Defina limites por categoria e acompanhe o progresso de suas metas.
                  </p>
                  <div className="inline-flex items-center text-c6-yellow text-sm font-semibold">
                    Controle total →
                  </div>
                </div>
              </div>
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
          <p className="text-lg sm:text-xl text-c6-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já simplificaram suas finanças
          </p>
          <Link
            href="/signup"
            className="btn-c6 inline-block text-lg"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-c6-gray-800">
        <div className="container mx-auto px-4 sm:px-6 text-center text-c6-gray-500 text-sm">
          <p>© 2025 BolsoCoin. Desenvolvido com 💚 por BRANDUP HUB</p>
        </div>
      </footer>
    </main>
  );
}
