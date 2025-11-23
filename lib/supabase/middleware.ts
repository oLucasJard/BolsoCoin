import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: Permitir acesso às páginas de autenticação sem validação
  const authPaths = ['/login', '/signup', '/auth'];
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  // Rotas públicas (não requerem autenticação)
  const publicPaths = ['/', '/login', '/signup', '/auth'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path);
  
  // Se for página pública, retornar sem validação
  if (isPublicPath) {
    return supabaseResponse;
  }

  // Atualizar sessão do usuário apenas para rotas protegidas
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas
  const protectedPaths = ['/dashboard', '/transacoes', '/magica', '/relatorios', '/orcamentos', '/workspaces'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Redirecionar para login se não autenticado e tentando acessar rota protegida
  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se usuário autenticado tenta acessar login/signup, redirecionar para dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

