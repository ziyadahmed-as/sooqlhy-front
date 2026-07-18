import { NextResponse, NextRequest } from 'next/server';
import type { NextMiddleware } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// ─── JWT payload shape ─────────────────────────────────────────────────────────
interface JwtPayload {
  role?:         string;   // "VENDOR" | "BUYER" | "ADMIN" | …
  is_verified?:  boolean;  // KYC status embedded by CustomTokenObtainPairSerializer
  email?:        string;
  exp?:          number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getToken(request: NextRequest): string | null {
  return request.cookies.get('access_token')?.value ?? null;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

// ─── Public route patterns (no auth required) ─────────────────────────────────
const PUBLIC_PATTERNS = [
  /^\/$/,
  /^\/home(\/|$)/,
  /^\/buyer\/catalog(\/.*)?$/,
  /^\/products\/.+/,
  /^\/auth\/.+/,
  /^\/register(\/|$)/,
  /^\/api\/.+/,
  /^\/_next\/.+/,
  /^\/static\/.+/,
  /^\/favicon\.ico$/,
];

// ─── Role → allowed route prefix map (JWT roles are UPPERCASE) ─────────────────
const ROLE_HOME: Record<string, string> = {
  BUYER:      '/buyer/catalog',
  VENDOR:     '/vendor/dashboard',
  DRIVER:     '/driver/dashboard',
  MODERATOR:  '/moderator/dashboard',
  ADMIN:      '/admin/dashboard',
  SUPER_ADMIN:'/super_admin/dashboard',
};

// Route segment → required JWT role (uppercase)
const SEGMENT_TO_ROLE: Record<string, string> = {
  buyer:       'BUYER',
  vendor:      'VENDOR',
  driver:      'DRIVER',
  moderator:   'MODERATOR',
  admin:       'ADMIN',
  super_admin: 'SUPER_ADMIN',
};

// ─── Middleware ────────────────────────────────────────────────────────────────
const middleware: NextMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes
  if (PUBLIC_PATTERNS.some((r) => r.test(pathname))) {
    return NextResponse.next();
  }

  // 2. Require a valid, non-expired JWT
  const token = getToken(request);
  if (!token) return redirectTo(request, '/auth/login');

  const payload = decodeToken(token);
  const isExpired = payload?.exp ? Date.now() >= payload.exp * 1000 : true;

  if (!payload?.role || isExpired) {
    // Clear stale cookie and redirect to login
    const response = redirectTo(request, '/auth/login');
    response.cookies.delete('access_token');
    return response;
  }

  const userRole = payload.role.toUpperCase();

  // 3. Role-segment guard
  //    e.g. /vendor/products → requires VENDOR role
  const segment = pathname.split('/')[1];
  const requiredRole = SEGMENT_TO_ROLE[segment];

  if (requiredRole) {
    const allowed =
      userRole === requiredRole ||
      // SUPER_ADMIN can access admin routes
      (userRole === 'SUPER_ADMIN' && requiredRole === 'ADMIN');

    if (!allowed) {
      // Redirect to the user's own home instead of a generic error
      const home = ROLE_HOME[userRole] ?? '/';
      return redirectTo(request, home);
    }

    // 4. KYC gate for vendor routes
    //    Vendors must be verified to access anything beyond /auth/kyc
    if (requiredRole === 'VENDOR') {
      if (payload.is_verified === false && !pathname.startsWith('/auth/kyc')) {
        return redirectTo(request, '/auth/kyc');
      }
      if (payload.is_verified === true && pathname.startsWith('/auth/kyc')) {
        return redirectTo(request, '/vendor/dashboard');
      }
    }

    // 5. KYC gate for driver routes
    //    Drivers must be verified to access dashboard features beyond /driver/kyc
    if (
      requiredRole === 'DRIVER' &&
      payload.is_verified === false &&
      !pathname.startsWith('/driver/kyc') &&
      !pathname.startsWith('/auth/kyc')
    ) {
      return redirectTo(request, '/driver/kyc');
    }
  }

  // 5. All checks passed
  return NextResponse.next();
};

export default middleware;

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
