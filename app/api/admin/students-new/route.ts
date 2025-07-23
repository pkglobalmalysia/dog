import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - List all students
export async function GET() {
  console.log('👥 Admin fetching all students...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Simple query to get all student profiles
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (studentsError) {
      console.error('❌ Failed to fetch students:', studentsError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch students: ' + studentsError.message 
      }, { status: 400 })
    }

    console.log('✅ Students fetched successfully:', students?.length || 0)

    // Format the students data for the frontend
    const formattedStudents = students?.map((student: any) => ({
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      ic_number: student.ic_number,
      phone: student.phone,
      address: student.address,
      profile_picture_url: student.profile_picture_url,
      approved: student.approved,
      created_at: student.created_at,
      // Add default values for enrollments if not available
      active_enrollments: 0,
      enrollments_count: 0
    })) || []

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      total: students?.length || 0
    })

  } catch (error) {
    console.error('❌ Students API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
