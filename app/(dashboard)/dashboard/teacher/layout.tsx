"use client"

import type React from "react"
import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
        return
      }

      if (profile) {
        if (profile.role !== "teacher") {
          // Redirect to appropriate dashboard based on role
          switch (profile.role) {
            case "student":
              router.replace("/dashboard/student")
              break
            case "admin":
              router.replace("/admin")
              break
            default:
              router.replace("/")
          }
          return
        }

        if (!profile.approved) {
          router.replace("/pending-approval")
          return
        }
      }
    }
  }, [user, profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (!user || !profile || profile.role !== "teacher" || !profile.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar role="teacher" />
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
