import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  
  if (!table) {
    return NextResponse.json({ error: 'Table name required' }, { status: 400 })
  }

  try {
    // Try to query the table with limit 1 to check if it exists
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        exists: false, 
        error: error.message,
        table: table
      }, { status: 200 })
    }

    return NextResponse.json({ 
      exists: true, 
      table: table,
      recordCount: data?.length || 0
    })

  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      table: table
    }, { status: 200 })
  }
}
