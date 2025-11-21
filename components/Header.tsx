'use client'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">💰</span>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              BolsoCoin
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition">
              Dashboard
            </a>
            <a href="/transactions" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition">
              Transações
            </a>
            <a href="/categories" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition">
              Categorias
            </a>
            <a href="/reports" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition">
              Relatórios
            </a>
          </nav>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            Entrar
          </button>
        </div>
      </div>
    </header>
  )
}

