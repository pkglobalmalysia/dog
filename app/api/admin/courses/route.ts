import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin Supabase client with service role key for admin operations
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

export async function GET() {
  console.log('✅ Fetching available courses...')
  
  try {
    // Use admin client to fetch courses from 'courses' table (bypasses RLS)
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, title, price, description, duration, status')
      .eq('status', 'active')
      .order('title')

    if (coursesError) {
      console.log('⚠️ Courses table error:', coursesError.message)
      return NextResponse.json({
        success: false,
        courses: [],
        error: coursesError.message,
        message: 'Course system not yet set up. Course tables will be created when needed.'
      })
    }

    console.log(`✅ Found ${courses?.length || 0} available courses`)

    return NextResponse.json({
      success: true,
      courses: courses?.map(course => ({
        id: course.id,
        title: course.title,
        price: course.price,
        description: course.description,
        duration: course.duration,
        status: course.status
      })) || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Courses fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
