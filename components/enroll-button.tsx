"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

interface EnrollButtonProps {
  courseId?: string
  className?: string
  children?: React.ReactNode
}

export function EnrollButton({ courseId, className, children }: EnrollButtonProps) {
  const { user, profile } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <button
        className={`bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all ${className}`}
        disabled
      >
        {children || "Enroll Now"}
      </button>
    )
  }

  // If user is logged in, direct them to enrollment
  if (user && profile?.role === "student") {
    return (
      <Link
        href={`/dashboard/student/enroll${courseId ? `?course=${courseId}` : ""}`}
        className={`bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all ${className}`}
      >
        {children || "Enroll Now"}
      </Link>
    )
  }

  // If user is not logged in, direct them to signup
  return (
    <Link
      href="/signup/student"
      className={`bg-[#ffc107] hover:bg-[#e6af06] text-[#0a2540] font-bold py-3 px-6 rounded-md transition-all ${className}`}
    >
      {children || "Enroll Now"}
    </Link>
  )
}
