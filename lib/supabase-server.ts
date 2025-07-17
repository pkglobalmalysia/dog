import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { SupabaseClient } from "@supabase/supabase-js"

export const createServerClient = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Get auth token from cookies
  const authToken = cookieStore.get('sb-ztdkbucjuynmoessbttje-auth-token')?.value
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : {}
    }
  })
  
  return supabase
}

// Server-side utility functions
export async function getServerSession() {
  const supabase = await createServerClient() // ✅ FIX: await added
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getServerProfile(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}
