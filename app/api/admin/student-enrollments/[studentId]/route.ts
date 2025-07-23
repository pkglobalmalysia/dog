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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const resolvedParams = await params
  console.log('📚 Fetching enrollments for student:', resolvedParams.studentId)
  
  try {
    // Get enrollments from BOTH tables to show complete enrollment picture
    console.log('🔍 Fetching from student_enrollments table...')
    const { data: studentEnrollments, error: studentEnrollmentsError } = await supabaseAdmin
      .from('student_enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          price,
          duration,
          status
        )
      `)
      .eq('student_id', resolvedParams.studentId)
      .order('created_at', { ascending: false })

    console.log('🔍 Fetching from main enrollments table...')
    const { data: mainEnrollments, error: mainEnrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          price,
          duration,
          status
        )
      `)
      .eq('student_id', resolvedParams.studentId)
      .order('enrolled_at', { ascending: false })

    // Combine enrollments from both tables
    let allEnrollments: any[] = []

    // Add student_enrollments with admin-specific fields
    if (studentEnrollments && !studentEnrollmentsError) {
      const formattedStudentEnrollments = studentEnrollments.map(enrollment => ({
        ...enrollment,
        courses_enhanced: enrollment.courses, // Rename for frontend compatibility
        source: 'admin_assigned',
        enrolled_at: enrollment.enrolled_at || enrollment.created_at,
        enrollment_status: enrollment.enrollment_status || 'enrolled'
      }))
      allEnrollments = [...allEnrollments, ...formattedStudentEnrollments]
    }

    // Add main enrollments (from student requests)
    if (mainEnrollments && !mainEnrollmentsError) {
      // Filter out duplicates (same course_id)
      const existingCourseIds = allEnrollments.map(e => e.course_id)
      const uniqueMainEnrollments = mainEnrollments.filter(
        enrollment => !existingCourseIds.includes(enrollment.course_id)
      )
      
      const formattedMainEnrollments = uniqueMainEnrollments.map(enrollment => ({
        ...enrollment,
        courses_enhanced: enrollment.courses, // Rename for frontend compatibility
        source: 'student_request',
        enrollment_status: 'enrolled',
        admin_notes: null
      }))
      allEnrollments = [...allEnrollments, ...formattedMainEnrollments]
    }

    // Sort by enrollment date
    allEnrollments.sort((a, b) => 
      new Date(b.enrolled_at || b.created_at).getTime() - 
      new Date(a.enrolled_at || a.created_at).getTime()
    )

    console.log(`✅ Found ${allEnrollments.length} total enrollments for student`)

    return NextResponse.json({
      success: true,
      enrollments: allEnrollments || [],
      total: allEnrollments?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Student enrollments fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
