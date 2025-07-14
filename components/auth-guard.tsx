"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to prevent flickering and allow proper initialization
    const timeoutId = setTimeout(() => {
      if (!isLoading && user && profile) {
        // Redirect logged-in users to their dashboard
        switch (profile.role) {
          case "student":
            router.push("/dashboard/student")
            break
          case "teacher":
            if (profile.approved) {
              router.push("/dashboard/teacher")
            } else {
              router.push("/pending-approval")
            }
            break
          case "admin":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [user, profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, don't show auth pages
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
