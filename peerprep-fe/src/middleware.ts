import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const isAuthPage =
    request.nextUrl.pathname === '/signin' ||
    request.nextUrl.pathname === '/signup';

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/signin', '/signup'],
};
