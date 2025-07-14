import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Skip middleware for static files, API routes, and auth test page
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname === "/auth-test"  // Skip auth test page
  ) {
    return res;
  }
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Get session - this is fast and doesn't require database queries
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("🔍 Middleware: Checking auth for", req.nextUrl.pathname);
    console.log("📊 Middleware: Session exists:", !!session);

    const isAuthPage = 
      req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname.startsWith("/signup");

    const isProtectedRoute = 
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname === "/pending-approval";

    // If no session and trying to access protected route, redirect to login
    if (!session && isProtectedRoute) {
      console.log("🚨 Middleware: No session, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If we have a session and trying to access auth pages, let it through
    // The client-side auth provider will handle the redirect
    if (session && isAuthPage) {
      console.log("✅ Middleware: Has session but accessing auth page, allowing through");
    }

    console.log("✅ Middleware: Allowing request to proceed");
    return res;
  } catch (error) {
    console.error("❌ Middleware error:", error);
    // Don't block on middleware errors, let client handle
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
