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
  
  // Se for página de autenticação, retornar sem validação
  if (isAuthPath) {
    return supabaseResponse;
  }

  // Atualizar sessão do usuário apenas para rotas protegidas
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas
  const protectedPaths = ['/dashboard', '/transacoes', '/magica', '/relatorios', '/orcamentos', '/workspaces'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Redirecionar para login se não autenticado
  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

