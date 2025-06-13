"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

interface RegisterButtonProps {
  eventId?: string
  className?: string
  children?: React.ReactNode
}

export function RegisterButton({ eventId, className, children }: RegisterButtonProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return (
      <button className={`text-[#0a2540] hover:text-[#0a2540]/80 font-medium ${className}`} disabled>
        {children || "Register"}
      </button>
    )
  }

  // If user is logged in, direct them to event registration
  if (user) {
    return (
      <Link
        href={`/events/register${eventId ? `/${eventId}` : ""}`}
        className={`text-[#0a2540] hover:text-[#0a2540]/80 font-medium ${className}`}
      >
        {children || "Register"}
      </Link>
    )
  }

  // If user is not logged in, direct them to login
  return (
    <Link
      href={`/login?redirect=/events/register${eventId ? `/${eventId}` : ""}`}
      className={`text-[#0a2540] hover:text-[#0a2540]/80 font-medium ${className}`}
    >
      {children || "Register"}
    </Link>
  )
}
