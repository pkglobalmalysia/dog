"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase"
import { profileCache } from "@/lib/auth-cache"

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      // Check cache first
      const cached = profileCache.get(userId)
      if (cached) {
        return cached
      }

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching profile:", error)
          return null
        }

        // Cache the result
        profileCache.set(userId, data)
        return data as Profile
      } catch (error) {
        console.error("Error fetching profile:", error)
        return null
      }
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Clear cache and fetch fresh data
      profileCache.clear(user.id)
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  const getDashboardPath = useCallback((role: string, approved?: boolean) => {
    switch (role) {
      case "student":
        return "/dashboard/student"
      case "teacher":
        return approved ? "/dashboard/teacher" : "/pending-approval"
      case "admin":
        return "/admin"
      default:
        return "/"
    }
  }, [])

  const handleAuthStateChange = useCallback(
    async (session: Session | null) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)

        // Only redirect if on auth pages or root
        if (profileData && (pathname === "/" || pathname === "/login" || pathname.startsWith("/signup"))) {
          const dashboardPath = getDashboardPath(profileData.role, profileData.approved)
          if (pathname !== dashboardPath) {
            router.replace(dashboardPath)
          }
        }
      } else {
        setProfile(null)
        profileCache.clear()

        // Only redirect if on protected routes
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
          router.replace("/login")
        }
      }
    },
    [fetchProfile, pathname, router, getDashboardPath],
  )

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        await handleAuthStateChange(session)
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setProfile(null)
        profileCache.clear()
        router.replace("/login")
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await handleAuthStateChange(session)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, handleAuthStateChange, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        // Profile will be fetched by auth state change handler
        return { error: null }
      }

      return { error }
    } catch (err: any) {
      console.error("Sign in error:", err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || email,
            role: userData.role || "student",
          },
        },
      })

      return { error }
    } catch (err: any) {
      console.error("Signup error:", err)
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading: isLoading || !initialized,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, session, isLoading, initialized, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}