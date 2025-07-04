import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { SupabaseClient } from "@supabase/supabase-js"


export const createServerClient = (): SupabaseClient => createServerComponentClient({ cookies })

// Server-side utility functions
export async function getServerSession() {
  const supabase = createServerClient() // ✅ FIX: client was missing
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getServerProfile(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}
