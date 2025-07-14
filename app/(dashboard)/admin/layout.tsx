"use client"

import type React from "react"
import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Add timeout protection for loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Admin layout loading timeout reached, forcing redirect to login")
        setTimeoutReached(true)
        router.replace("/login")
      }
    }, 20000) // 20 second timeout (increased since profile fetch now has 15s timeout)

    return () => clearTimeout(timeout)
  }, [isLoading, router])

  useEffect(() => {
    if (!isLoading && !timeoutReached) {
      if (!user) {
        console.log("No user found, redirecting to login")
        router.replace("/login")
        return
      }

      if (profile) {
        if (profile.role !== "admin") {
          console.log("User is not admin, role:", profile.role)
          // Redirect to appropriate dashboard based on role
          switch (profile.role) {
            case "student":
              router.replace("/dashboard/student")
              break
            case "teacher":
              router.replace(profile.approved ? "/dashboard/teacher" : "/pending-approval")
              break
            default:
              router.replace("/")
          }
        } else {
          console.log("User is admin, allowing access")
        }
      } else if (user) {
        // User exists but no profile - this shouldn't happen but handle it
        console.log("User exists but no profile found")
      }
    }
  }, [user, profile, isLoading, router, timeoutReached])

  if (timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Session timeout, redirecting..." />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin panel..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting to login..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  if (profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar role="admin" />
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
