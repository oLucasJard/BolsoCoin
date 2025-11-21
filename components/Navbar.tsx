'use client';

import Link from 'next/link';
import UserButton from './UserButton';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Sparkles, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
    { href: '/magica', label: 'Página Mágica', icon: Sparkles },
    { href: '/orcamentos', label: 'Orçamentos & Metas', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                BolsoCoin
              </span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <UserButton />
        </div>
      </div>
    </nav>
  );
}

