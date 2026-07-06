import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  const suspiciousPatterns = [
    /\.env/i, /\.git/i, /wp-admin/i, /phpmyadmin/i, /\.sql/i, /\.config/i,
  ];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (url.includes('..') || url.includes('%2e%2e')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|txt|xml|json)$).*)',
  ],
};
