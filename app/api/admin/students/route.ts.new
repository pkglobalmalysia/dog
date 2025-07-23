import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - List all students
export async function GET(request: Request) {
  console.log('👥 Admin fetching all students...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query for students with enrollments and payments
    let query = supabase
      .from('profiles')
      .select(`
        *,
        enrollments:student_enrollments(
          id,
          enrollment_status,
          payment_status,
          enrolled_at,
          course:courses(
            id,
            title,
            price
          )
        ),
        payments:student_payments(
          id,
          amount,
          payment_status,
          created_at
        )
      `, { count: 'exact' })
      .eq('user_type', 'student')

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,ic_number.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: students, error: studentsError, count } = await query

    if (studentsError) {
      console.error('❌ Failed to fetch students:', studentsError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch students: ' + studentsError.message 
      }, { status: 400 })
    }

    console.log('✅ Found', students?.length || 0, 'students')

    const formattedStudents = students?.map(student => ({
      id: student.id,
      email: student.email,
      full_name: student.full_name,
      ic_number: student.ic_number,
      phone: student.phone,
      address: student.address,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      emergency_contact: student.emergency_contact,
      profile_image_url: student.profile_image_url,
      created_at: student.created_at,
      updated_at: student.updated_at,
      enrollments_count: student.enrollments?.length || 0,
      active_enrollments: student.enrollments?.filter((e: any) => e.enrollment_status === 'active').length || 0,
      total_payments: student.payments?.reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0,
      pending_payments: student.payments?.filter((p: any) => p.payment_status === 'pending').length || 0,
      enrollments: student.enrollments || [],
      payments: student.payments || []
    })) || []

    return NextResponse.json({
      success: true,
      message: 'Students fetched successfully',
      students: formattedStudents,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: to < (count || 0) - 1,
        has_previous: page > 1
      },
      filters: { search, status },
      summary: {
        total_students: count || 0,
        active_enrollments: formattedStudents.reduce((sum, s) => sum + s.active_enrollments, 0),
        pending_payments: formattedStudents.reduce((sum, s) => sum + s.pending_payments, 0)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Students fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
