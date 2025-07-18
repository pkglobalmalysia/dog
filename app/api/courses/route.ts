import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Fetch all active courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        scheduled_time,
        teacher_id,
        status,
        max_students,
        created_at,
        profiles(full_name),
        enrollments(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedCourses = (courses || []).map((course) => {
      const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles
      const enrollmentCount = Array.isArray(course.enrollments) ? course.enrollments.length : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        teacher_name: teacherProfile?.full_name || 'No Teacher Assigned',
        scheduled_time: course.scheduled_time,
        student_count: enrollmentCount,
        max_students: course.max_students || 30,
        status: course.status || 'active',
        created_at: course.created_at,
      }
    })

    return NextResponse.json({ 
      success: true, 
      courses: formattedCourses,
      count: formattedCourses.length 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
