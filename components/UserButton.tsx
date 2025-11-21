'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function UserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) return null;

  const userInitial = user.email?.[0]?.toUpperCase() || 'U';
  const userName = user.user_metadata?.name || 'Usuário';
  const userEmail = user.email;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-c6-gray-900 hover:bg-c6-gray-800 px-3 py-2 rounded-c6-sm transition-all touch-manipulation"
      >
        <div className="w-8 h-8 rounded-full bg-c6-yellow text-c6-black font-bold flex items-center justify-center text-sm">
          {userInitial}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-white">{userName}</span>
        <ChevronDown 
          size={16} 
          className={`text-c6-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div 
            className="sm:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-c6-gray-900 rounded-c6 shadow-c6-lg border border-c6-gray-800 overflow-hidden z-50">
            <div className="p-4 border-b border-c6-gray-800">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-c6-gray-400 truncate">{userEmail}</p>
            </div>

            <button
              onClick={() => {
                router.push('/dashboard');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-c6-gray-300 hover:bg-c6-gray-800 flex items-center space-x-3 transition-colors touch-manipulation"
            >
              <User size={16} />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-c6-gray-800 flex items-center space-x-3 transition-colors touch-manipulation border-t border-c6-gray-800"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
