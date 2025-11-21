'use client';

import Link from 'next/link';
import UserButton from './UserButton';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Sparkles, Target, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
    { href: '/magica', label: 'IA', icon: Sparkles },
    { href: '/orcamentos', label: 'Metas', icon: Target },
  ];

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <nav className="hidden sm:block bg-c6-black border-b border-c6-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-c6-yellow rounded-full flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <span className="font-display text-xl font-bold">
                Bolso<span className="text-c6-yellow">Coin</span>
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-c6-sm transition-all ${
                      isActive
                        ? 'bg-c6-yellow text-c6-black font-bold'
                        : 'text-c6-gray-300 hover:bg-c6-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <UserButton />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-c6-black border-t border-c6-gray-800 pb-safe z-50">
        <div className="flex items-center justify-around py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-c6-sm transition-all touch-manipulation ${
                  isActive ? 'text-c6-yellow' : 'text-c6-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="sm:hidden bg-c6-black border-b border-c6-gray-800 sticky top-0 z-50 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-c6-yellow rounded-full flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <span className="font-display text-lg font-bold">
              Bolso<span className="text-c6-yellow">Coin</span>
            </span>
          </Link>
          
          <UserButton />
        </div>
      </div>
    </>
  );
}
