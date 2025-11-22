'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast.success('Conta criada! Verifique seu email.');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-c6-black text-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 pt-safe">
        <Link href="/" className="inline-flex items-center text-c6-gray-400 hover:text-white transition">
          <ArrowLeft size={20} className="mr-2" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-c6-yellow rounded-full mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Crie sua conta
            </h1>
            <p className="text-c6-gray-400">
              Comece a controlar suas finanças hoje
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-c6-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-c6"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c6-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-c6"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-c6-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-c6"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-c6 w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Criando conta...</span>
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-c6-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-c6-yellow hover:text-c6-yellow-light font-semibold">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
