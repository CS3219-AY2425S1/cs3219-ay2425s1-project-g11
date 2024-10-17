import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const baseURL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://172.17.0.1:3001/api/v1';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access-token');

  // Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Check if accessing /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Cannot use Axios in edge runtime
      const res = await fetch(`${baseURL}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      });

      const data = await res.json();

      // Check if the user is an admin
      if (res.status !== 200 || !data.data.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url)); // Redirect in case of error
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.redirect(new URL('/', request.url)); // Redirect on error
    }
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - The root path "/"
     * - /signin and /signout paths
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */

    '/((?!signin|_next/static|_next/image|$|signup|.*\\.png$).*)',
  ],
};
