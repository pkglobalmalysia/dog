import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Skip middleware for static files and API routes
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/api") ||
      req.nextUrl.pathname.includes(".")
    ) {
      return res
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error in middleware:", sessionError)
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Public routes that don't need auth - UPDATED to include about, courses, and events
    const publicRoutes = ["/", "/login", "/signup", "/about", "/events", "/programs"]
    const isPublicRoute = publicRoutes.some(
      (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + "/"),
    )

    // Redirect to login if not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Skip role checks for public routes
    if (isPublicRoute) {
      return res
    }

    // Only do role checks for authenticated users on protected routes
    if (session) {
      const needsRoleCheck =
        req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/dashboard/teacher") ||
        req.nextUrl.pathname.startsWith("/dashboard/student") ||
        req.nextUrl.pathname === "/pending-approval"

      if (needsRoleCheck) {
        try {
          // Use a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Profile fetch timeout")), 3000),
          )

          const profilePromise = supabase.from("profiles").select("role, approved").eq("id", session.user.id).single()

          const { data: profile, error: profileError } = (await Promise.race([profilePromise, timeoutPromise])) as any

          if (profileError) {
            console.error("Profile fetch error:", profileError)
            // Don't block access, let the client handle it
            return res
          }

          if (profile) {
            // Admin access check
            if (req.nextUrl.pathname.startsWith("/admin") && profile.role !== "admin") {
              return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, req.url))
            }

            // Teacher access check
            if (req.nextUrl.pathname.startsWith("/dashboard/teacher")) {
              if (profile.role !== "teacher") {
                return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, req.url))
              }
              if (!profile.approved) {
                return NextResponse.redirect(new URL("/pending-approval", req.url))
              }
            }

            // Student access check
            if (req.nextUrl.pathname.startsWith("/dashboard/student") && profile.role !== "student") {
              const redirectPath =
                profile.role === "teacher" ? (profile.approved ? "/dashboard/teacher" : "/pending-approval") : "/admin"
              return NextResponse.redirect(new URL(redirectPath, req.url))
            }
          }
        } catch (error) {
          console.error("Role check error:", error)
          // Don't block access on error, let the client handle it
        }
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // Don't block on middleware errors
  }

  return res
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
}
