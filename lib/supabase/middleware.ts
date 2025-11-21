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

  // Atualizar sessão do usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas
  const protectedPaths = ['/dashboard', '/transacoes', '/magica', '/relatorios'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Redirecionar para login se não autenticado
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirecionar para dashboard se já autenticado e tentar acessar auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

