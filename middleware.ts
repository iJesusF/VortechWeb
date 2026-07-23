import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection.
 * In production with Supabase configured, this checks for valid session.
 * Without Supabase, admin routes are accessible for development.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      // When Supabase is configured, check for auth cookie
      const authCookie = request.cookies.get("sb-access-token") ||
        request.cookies.getAll().find(c => c.name.includes("auth-token"));

      if (!authCookie) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    // Without Supabase, allow access for development
  }

  // Prevent indexing of quotation public pages
  if (pathname.startsWith("/cotizacion/")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cotizacion/:path*"],
};
