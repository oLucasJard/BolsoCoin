import Link from 'next/link';
import { MessageSquare, Mic, Image, Zap, Bot, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center space-y-8 mb-20">
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-bold text-green-600 dark:text-green-400">
              💰 BolsoCoin
            </h1>
            <p className="text-3xl text-gray-800 dark:text-gray-200 font-semibold">
              Central de Gerenciamento de Carteira
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Adicione suas transações usando <span className="font-semibold text-green-600">texto, áudio ou imagem</span>.
              Zero fricção, IA poderosa, controle total.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/sign-up"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Começar Gratuitamente
            </Link>
            <Link
              href="/sign-in"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-4 px-8 rounded-lg shadow-lg transition-all border-2 border-green-600"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Features - Input Methods */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            ✨ Entrada de Dados com IA
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-green-500 transition">
              <MessageSquare size={48} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Texto Natural
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                "Café 15 reais" e pronto! A IA entende e categoriza automaticamente.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-green-500 transition">
              <Mic size={48} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Áudio
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fale sua transação e deixe o Whisper transcrever e processar.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-green-500 transition">
              <Image size={48} className="text-purple-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Foto de Recibo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tire uma foto do cupom fiscal e a IA extrai todas as informações.
              </p>
            </div>
          </div>
        </div>

        {/* Features - Main */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            🚀 Recursos Poderosos
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <Zap size={48} className="text-yellow-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Zero Fricção
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Esqueça formulários chatos. Adicione transações em segundos.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <Bot size={48} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Bot do Telegram
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adicione transações direto do Telegram, onde você já está.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <Shield size={48} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Seguro e Privado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seus dados são seus. Criptografia e segurança em primeiro lugar.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para simplificar suas finanças?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se ao BolsoCoin e tenha controle total com zero esforço
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 inline-block"
          >
            Começar Agora - É Grátis
          </Link>
        </div>
      </div>
    </main>
  );
}

