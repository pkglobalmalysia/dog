import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('✅ Admin assigning course to student...')
  
  try {
    const supabase = createRouteHandlerClient({ 
      cookies
    })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requestData = await request.json()
    const {
      student_id,
      course_id,
      enrollment_status = 'pending',
      payment_status = 'pending',
      admin_notes
    } = requestData

    console.log('📋 Course assignment details:', { student_id, course_id, enrollment_status })

    // 1. Check if student is already enrolled in either table
    const { data: existingStudentEnrollment } = await supabase
      .from('student_enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single()

    const { data: existingMainEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single()

    if (existingStudentEnrollment || existingMainEnrollment) {
      return NextResponse.json({ 
        error: 'Student is already enrolled in this course' 
      }, { status: 400 })
    }

    // 2. Create enrollment record in student_enrollments table (for admin tracking)
    const { data: studentEnrollment, error: studentEnrollmentError } = await supabase
      .from('student_enrollments')
      .insert({
        student_id,
        course_id,
        enrollment_status,
        enrolled_at: new Date().toISOString(),
        admin_notes
      })
      .select()
      .single()

    if (studentEnrollmentError) {
      console.error('❌ Student enrollment creation failed:', studentEnrollmentError.message)
      return NextResponse.json({ 
        error: 'Failed to create student enrollment: ' + studentEnrollmentError.message 
      }, { status: 400 })
    }

    // 3. ALSO create enrollment record in main enrollments table (for student dashboard)
    const { data: mainEnrollment, error: mainEnrollmentError } = await supabase
      .from('enrollments')
      .insert({
        student_id,
        course_id,
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single()

    if (mainEnrollmentError) {
      console.error('❌ Main enrollment creation failed:', mainEnrollmentError.message)
      // If main enrollment fails, clean up the student_enrollments record
      await supabase.from('student_enrollments').delete().eq('id', studentEnrollment.id)
      return NextResponse.json({ 
        error: 'Failed to create main enrollment: ' + mainEnrollmentError.message 
      }, { status: 400 })
    }

    console.log('✅ Course assigned successfully to both enrollment tables')

    // Get student and course details for response
    const { data: studentDetails } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', student_id)
      .single()

    const { data: courseDetails } = await supabase
      .from('courses')
      .select('title, price')
      .eq('id', course_id)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Course assigned successfully',
      enrollment: {
        id: studentEnrollment.id,
        student_name: studentDetails?.full_name,
        student_email: studentDetails?.email,
        course_title: courseDetails?.title,
        course_price: courseDetails?.price,
        enrollment_status: studentEnrollment.enrollment_status,
        enrolled_at: studentEnrollment.enrolled_at,
        admin_notes: studentEnrollment.admin_notes
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Course assignment error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
