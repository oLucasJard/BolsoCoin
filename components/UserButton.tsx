'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
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

    // Close dropdown when clicking outside
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
      toast.success('Logout realizado com sucesso!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) return null;

  const userInitial = user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center justify-center"
      >
        {userInitial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.user_metadata?.name || 'Usuário'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>

          <button
            onClick={() => {
              router.push('/dashboard');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <User size={16} />
            <span>Perfil</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}

