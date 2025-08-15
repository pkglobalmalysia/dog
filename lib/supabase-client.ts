import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a singleton Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

// Test function to verify Supabase connection
export async function testSupabaseConnection() {
  try {
    const supabase = getSupabaseClient()

    console.log("🔍 Testing Supabase connection...")

    // Test with a very simple query first
    const { data, error, status } = await supabase.from("profiles").select("id").limit(1)

    console.log("📊 Connection test result:", {
      data: data ? `Found ${data.length} records` : "No data",
      error: error ? error.message : "None",
      status,
    })

    if (error) {
      console.error("❌ Supabase connection test failed:", error)
      return { success: false, error }
    }

    console.log("✅ Supabase connection test passed")
    return { success: true, data }
  } catch (error: any) {
    console.error("💥 Supabase connection test exception:", error)
    return { success: false, error }
  }
}

// Function to get profile with simplified error handling
export async function getProfile(userId: string) {
  try {
    const supabase = getSupabaseClient()

    console.log("🔍 Getting profile for user:", userId)

    // First check if we have a valid session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("❌ Session error:", sessionError)
      throw new Error(`Session error: ${sessionError.message}`)
    }

    if (!session) {
      console.error("❌ No active session")
      throw new Error("No active session")
    }

    console.log("✅ Valid session found for:", session.user.email)

    // Try to get the profile with a very simple query
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, approved, created_at, updated_at")
      .eq("id", userId)
      .single()

    console.log("📊 Profile query result:", {
      data: data ? "Found profile" : "No profile",
      error: error ? error.message : "None",
    })

    if (error) {
      console.error("❌ Profile query error:", error)
      throw new Error(`Database error: ${error.message || "Unknown error"}`)
    }

    if (!data) {
      throw new Error("No profile data returned")
    }

    console.log("✅ Profile retrieved successfully:", {
      id: data.id,
      name: data.full_name,
      role: data.role,
      approved: data.approved,
    })
    return data
  } catch (error: any) {
    console.error("💥 getProfile error:", error)
    throw error
  }
}

// Function to test profile access specifically
export async function testProfileAccess() {
  try {
    const supabase = getSupabaseClient()

    console.log("🧪 Testing profile access...")

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { success: false, error: "No valid session" }
    }

    // Try to access the user's own profile
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, approved")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("❌ Profile access test failed:", error)
      return { success: false, error }
    }

    console.log("✅ Profile access test passed:", data)
    return { success: true, data }
  } catch (error: any) {
    console.error("💥 Profile access test exception:", error)
    return { success: false, error }
  }
}

// Function to test basic database operations
export async function testBasicOperations() {
  try {
    const supabase = getSupabaseClient()

    console.log("🧪 Testing basic database operations...")

    // Test 1: Count profiles
    const { data: profileCount, error: countError } = await supabase.from("profiles").select("id", { count: "exact" })

    if (countError) {
      return { success: false, error: `Count test failed: ${countError.message}` }
    }

    // Test 2: Get current user's profile
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "No session for profile test" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: `Profile test failed: ${profileError.message}` }
    }

    console.log("✅ Basic operations test passed")
    return {
      success: true,
      data: {
        profileCount: profileCount?.length || 0,
        currentProfile: profile,
      },
    }
  } catch (error: any) {
    console.error("💥 Basic operations test exception:", error)
    return { success: false, error: error.message }
  }
}
