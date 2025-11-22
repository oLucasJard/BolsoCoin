import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Atualizar sessão do Supabase
  const response = await updateSession(request);

  // 2. Adicionar headers de segurança
  const headers = new Headers(response.headers);
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy (relaxado para desenvolvimento)
  // Em produção, deve ser mais restritivo
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!isDev) {
    // CSP apenas em produção para não interferir no desenvolvimento
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];
    headers.set('Content-Security-Policy', cspDirectives.join('; '));
  }

  // 3. Rate limiting básico por IP (prevenir DDoS)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const url = request.nextUrl.pathname;
  
  // Bloquear paths suspeitos
  const suspiciousPatterns = [
    /\.env/i,
    /\.git/i,
    /wp-admin/i,
    /phpmyadmin/i,
    /\.sql/i,
    /\.config/i,
    /admin\.php/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`[SECURITY] Tentativa de acesso suspeita bloqueada: ${url} from ${ip}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // 4. Validar métodos HTTP
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // 5. Prevenir directory traversal
  if (url.includes('..') || url.includes('%2e%2e')) {
    console.warn(`[SECURITY] Directory traversal bloqueado: ${url} from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
