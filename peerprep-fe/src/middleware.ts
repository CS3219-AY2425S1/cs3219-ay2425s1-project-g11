import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access-token');

  // Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url)); // Ensure redirection response is returned
  }

  // Check if accessing /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const res = await axios.get(
        'http://localhost:3001/api/v1/auth/verify-token',
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      );
      console.log(res.status);

      // Check if the response is valid
      if (res.status !== 200) {
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
