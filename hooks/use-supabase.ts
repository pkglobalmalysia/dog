import { useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Custom hook to provide a stable Supabase client instance
export function useSupabase() {
  const supabase = useMemo(() => {
    return createClientComponentClient()
  }, [])

  return supabase
}

// For compatibility with existing code, export a direct client instance
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}
