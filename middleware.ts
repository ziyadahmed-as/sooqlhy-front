import { NextResponse, NextRequest } from 'next/server';
import type { NextMiddleware } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * Define the shape of our JWT payload.
 */
 interface JwtPayload {
   role?: string;
 };

/**
 * Helper to extract the JWT from cookies.
 */
 function getToken(request: NextRequest): string | null {
   const token = request.cookies.get('access_token')?.value;
   return token ?? null;
 }

/**
 * Decode the JWT payload safely.
 */
 function decodeToken(token: string): JwtPayload | null {
  try {
    // Decode the JWT using the named import
    return jwtDecode(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware that:
 *  - Allows public routes (auth pages, api routes, static files).
 *  - Redirects unauthenticated users to /login.
 *  - Redirects users with a role that does not match the protected segment to a fallback page.
 */
 const middleware: NextMiddleware = (request: NextRequest) => {
   const { pathname } = request.nextUrl;

   // Public routes – auth pages and Next.js static assets
    const publicRoutes = [
      /^\/$/,
      /^\/home(\/|$)/,
      /^\/buyer\/catalog(\/|$)/,
      /^\/products\/.*$/,
      /^\/auth\/login(\/|$)/,
      /^\/auth\/register(\/|$)/,
      /^\/auth\/forgot-password(\/|$)/,
      /^\/auth\/reset-password(\/|$)/,
      /^\/api\/.*$/,
      /^\/static\/.*$/,
      /^\/\_next\/.*$/,
    ];

   if (publicRoutes.some((r) => r.test(pathname))) {
     return NextResponse.next();
   }

   // Check JWT
   const token = getToken(request);
   if (!token) {
     // No token → redirect to login
     const loginUrl = request.nextUrl.clone();
     loginUrl.pathname = '/auth/login';
     return NextResponse.redirect(loginUrl);
   }

   const payload = decodeToken(token);
   if (!payload?.role) {
     // Invalid payload – treat as unauthenticated
     const loginUrl = request.nextUrl.clone();
     loginUrl.pathname = '/auth/login';
     return NextResponse.redirect(loginUrl);
   }

   // Role‑based protection – the first segment after the root determines the area
   const roleSegment = pathname.split('/')[1]; // e.g. "buyer", "vendor", etc.
   const allowedRoles: Record<string, string> = {
     buyer: 'buyer',
     vendor: 'vendor',
     driver: 'driver',
     moderator: 'moderator',
     admin: 'admin',
   };

   const requiredRole = allowedRoles[roleSegment];
   if (requiredRole && payload.role !== requiredRole) {
     // Role mismatch – redirect to a safe fallback (home page of user's role)
     const fallbackUrl = request.nextUrl.clone();
     fallbackUrl.pathname = `/${payload.role}`;
     return NextResponse.redirect(fallbackUrl);
   }

   // All checks passed – allow request to continue
   return NextResponse.next();
 };

export default middleware;

/**
 * Configure which paths the middleware runs on.
 * By default it runs on all routes; we exclude static assets and API routes.
 */
 export const config = {
   matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
 };
