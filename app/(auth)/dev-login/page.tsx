'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Zap, AlertTriangle } from 'lucide-react';

export default function DevLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDevLogin = async () => {
    setLoading(true);

    try {
      // Criar usuário de teste se não existir
      const testEmail = 'teste@bolsocoin.dev';
      const testPassword = 'teste123456';

      // Tentar fazer login primeiro
      let { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // Se não existir, criar
      if (error && error.message.includes('Invalid')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              name: 'Usuário Teste',
            },
            emailRedirectTo: undefined, // Não enviar email
          },
        });

        if (signUpError) throw signUpError;

        // Fazer login após criar
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (loginError) throw loginError;
      }

      toast.success('Login de teste realizado!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Zap size={64} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dev Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acesso rápido para testes e desenvolvimento
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-orange-800 dark:text-orange-300">
                <p className="font-semibold mb-1">⚠️ Apenas para Desenvolvimento</p>
                <p>Este login cria automaticamente um usuário de teste.</p>
                <p className="mt-2 font-mono text-xs">
                  Email: teste@bolsocoin.dev<br />
                  Senha: teste123456
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Login Instantâneo de Teste</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            >
              ← Voltar para login normal
            </a>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-semibold mb-2">💡 Dica de Desenvolvimento:</p>
          <p>Use este login para testar rapidamente sem precisar criar contas ou confirmar emails.</p>
        </div>
      </div>
    </div>
  );
}

