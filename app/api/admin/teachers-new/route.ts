import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - List all teachers
export async function GET() {
  console.log('👨‍🏫 Admin fetching all teachers...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Simple query to get all teacher profiles
    const { data: teachers, error: teachersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    if (teachersError) {
      console.error('❌ Failed to fetch teachers:', teachersError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch teachers: ' + teachersError.message 
      }, { status: 400 })
    }

    console.log('✅ Teachers fetched successfully:', teachers?.length || 0)

    // Format the teachers data for the frontend
    const formattedTeachers = teachers?.map((teacher: any) => ({
      id: teacher.id,
      full_name: teacher.full_name,
      email: teacher.email,
      ic_number: teacher.ic_number,
      phone: teacher.phone,
      address: teacher.address,
      approved: teacher.approved,
      created_at: teacher.created_at,
      // Add default values for courses if not available
      total_courses: 0,
      active_courses: 0
    })) || []

    return NextResponse.json({
      success: true,
      teachers: formattedTeachers,
      total: teachers?.length || 0
    })

  } catch (error) {
    console.error('❌ Teachers API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
