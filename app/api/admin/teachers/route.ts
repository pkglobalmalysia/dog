import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

// GET - List all teachers
export async function GET(request: Request) {
  console.log('👨‍🏫 Admin fetching all teachers...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''

    let query = supabase
      .from('profiles')
      .select(`
        *,
        assigned_courses:courses_enhanced(
          id,
          title,
          description,
          price,
          status
        ),
        salary_info:teacher_salaries(
          id,
          hourly_rate,
          bank_account_name,
          bank_account_number,
          bank_name,
          is_active
        )
      `)
      .eq('user_type', 'teacher')
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,specializations.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: teachers, error: teachersError, count } = await supabase
      .from('profiles')
      .select(`
        *,
        assigned_courses:courses_enhanced(
          id,
          title,
          description,
          price,
          status
        ),
        salary_info:teacher_salaries(
          id,
          hourly_rate,
          bank_account_name,
          bank_account_number,
          bank_name,
          is_active
        )
      `, { count: 'exact' })
      .eq('user_type', 'teacher')
      .or(search ? `full_name.ilike.%${search}%,email.ilike.%${search}%,specializations.ilike.%${search}%` : 'id.not.is.null')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (teachersError) {
      console.error('❌ Failed to fetch teachers:', teachersError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch teachers: ' + teachersError.message 
      }, { status: 400 })
    }

    console.log('✅ Found', teachers?.length || 0, 'teachers')

    const formattedTeachers = teachers?.map(teacher => ({
      id: teacher.id,
      email: teacher.email,
      full_name: teacher.full_name,
      ic_number: teacher.ic_number,
      phone: teacher.phone,
      address: teacher.address,
      date_of_birth: teacher.date_of_birth,
      gender: teacher.gender,
      emergency_contact: teacher.emergency_contact,
      profile_image_url: teacher.profile_image_url,
      qualifications: teacher.qualifications,
      specializations: teacher.specializations,
      experience_years: teacher.experience_years,
      teaching_subjects: teacher.teaching_subjects,
      created_at: teacher.created_at,
      updated_at: teacher.updated_at,
      courses_count: teacher.assigned_courses?.length || 0,
      active_courses: teacher.assigned_courses?.filter((c: any) => c.status === 'active').length || 0,
      hourly_rate: teacher.salary_info?.[0]?.hourly_rate || 0,
      has_salary_setup: !!(teacher.salary_info?.length),
      assigned_courses: teacher.assigned_courses || [],
      salary_info: teacher.salary_info?.[0] || null
    })) || []

    return NextResponse.json({
      success: true,
      message: 'Teachers fetched successfully',
      teachers: formattedTeachers,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: to < (count || 0) - 1,
        has_previous: page > 1
      },
      filters: { search },
      summary: {
        total_teachers: count || 0,
        active_courses: formattedTeachers.reduce((sum, t) => sum + t.active_courses, 0),
        teachers_with_salary: formattedTeachers.filter(t => t.has_salary_setup).length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Teachers fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete teacher
export async function DELETE(request: Request) {
  console.log('🗑️ Admin deleting teacher...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { teacher_id } = await request.json()

    // 1. Remove teacher from assigned courses
    await supabase
      .from('courses_enhanced')
      .update({ instructor_id: null })
      .eq('instructor_id', teacher_id)

    // 2. Delete related records
    await supabase.from('teacher_salaries').delete().eq('teacher_id', teacher_id)
    await supabase.from('user_roles').delete().eq('user_id', teacher_id)
    
    // 3. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', teacher_id)

    // 4. Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(teacher_id)

    if (profileError && !profileError.message.includes('No rows')) {
      console.warn('⚠️ Profile deletion warning:', profileError.message)
    }

    if (authError) {
      console.warn('⚠️ Auth deletion warning:', authError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully',
      teacher_id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Teacher deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
