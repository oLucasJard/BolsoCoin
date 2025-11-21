export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-green-600 dark:text-green-400">
              💰 BolsoCoin
            </h1>
            <p className="text-2xl text-gray-700 dark:text-gray-300">
              Gerenciamento Financeiro Simplificado
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Controle Total
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe todas as suas receitas e despesas em um só lugar
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Gestão Inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Categorize e organize suas finanças de forma simples
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Visualização Clara
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gráficos e relatórios para melhor compreensão financeira
              </p>
            </div>
          </div>

          <div className="mt-12">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105">
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

