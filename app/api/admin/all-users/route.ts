import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - List all users (students and teachers)
export async function GET() {
  console.log('👥 Admin fetching all users...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Simple query to get all user profiles (students and teachers)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['student', 'teacher'])
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch users: ' + usersError.message 
      }, { status: 400 })
    }

    console.log('✅ Users fetched successfully:', users?.length || 0)

    // Separate students and teachers
    const students = users?.filter(user => user.role === 'student') || []
    const teachers = users?.filter(user => user.role === 'teacher') || []

    // Format the data for the frontend
    const formattedUsers = users?.map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      ic_number: user.ic_number,
      phone: user.phone,
      address: user.address,
      date_of_birth: user.date_of_birth,
      emergency_contact: user.emergency_contact,
      approved: user.approved,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      students: students.map((student: any) => ({
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        ic_number: student.ic_number,
        phone: student.phone,
        address: student.address,
        approved: student.approved,
        created_at: student.created_at,
        // Default values
        enrollment_status: 'active',
        payment_status: 'pending'
      })),
      teachers: teachers.map((teacher: any) => ({
        id: teacher.id,
        full_name: teacher.full_name,
        email: teacher.email,
        ic_number: teacher.ic_number,
        phone: teacher.phone,
        address: teacher.address,
        approved: teacher.approved,
        created_at: teacher.created_at,
        // Default values
        total_courses: 0,
        active_courses: 0
      })),
      totals: {
        students: students.length,
        teachers: teachers.length,
        total_users: users?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ All users API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
