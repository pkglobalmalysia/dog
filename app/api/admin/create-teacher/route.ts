import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('👨‍🏫 Admin creating new teacher...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requestData = await request.json()
    const {
      email,
      password,
      full_name,
      ic_number,
      phone,
      address,
      date_of_birth,
      gender,
      emergency_contact,
      profile_image_url,
      // Teacher-specific fields
      qualifications,
      specializations,
      experience_years,
      teaching_subjects,
      salary_per_hour,
      bank_account_name,
      bank_account_number,
      bank_name,
      courses_to_assign = []
    } = requestData

    console.log('📝 Creating teacher with email:', email)

    // 1. Create user in Supabase Auth using Admin API
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        user_type: 'teacher',
        created_by_admin: true
      }
    })

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message)
      return NextResponse.json({ 
        error: 'Failed to create user account: ' + authError.message 
      }, { status: 400 })
    }

    console.log('✅ User created in auth:', newUser.user.id)

    // 2. Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: email,
        full_name: full_name,
        ic_number: ic_number,
        phone: phone,
        address: address,
        date_of_birth: date_of_birth,
        gender: gender,
        emergency_contact: emergency_contact,
        profile_image_url: profile_image_url,
        user_type: 'teacher',
        qualifications: qualifications,
        specializations: specializations,
        experience_years: experience_years,
        teaching_subjects: teaching_subjects,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      // Try to cleanup the auth user if profile fails
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ 
        error: 'Failed to create teacher profile: ' + profileError.message 
      }, { status: 400 })
    }

    console.log('✅ Teacher profile created')

    // 3. Create initial teacher salary record
    if (salary_per_hour) {
      const { error: salaryError } = await supabase
        .from('teacher_salaries')
        .insert({
          teacher_id: newUser.user.id,
          hourly_rate: parseFloat(salary_per_hour),
          bank_account_name: bank_account_name,
          bank_account_number: bank_account_number,
          bank_name: bank_name,
          created_by: session.user.id,
          is_active: true
        })

      if (salaryError) {
        console.warn('⚠️ Salary record warning:', salaryError.message)
      } else {
        console.log('✅ Teacher salary record created')
      }
    }

    // 4. Assign teacher to courses if specified
    const assignmentResults = []
    for (const courseId of courses_to_assign) {
      const { data: course } = await supabase
        .from('courses_enhanced')
        .select('*')
        .eq('id', courseId)
        .single()

      if (course) {
        // Update course to assign this teacher
        const { error: assignError } = await supabase
          .from('courses_enhanced')
          .update({ 
            instructor_id: newUser.user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId)

        assignmentResults.push({
          course_id: courseId,
          course_title: course.title,
          success: !assignError,
          error: assignError?.message
        })
      }
    }

    console.log('✅ Course assignments processed:', assignmentResults.length)

    // 5. Create user role record
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'teacher',
        assigned_by: session.user.id,
        is_primary: true
      })

    if (roleError) {
      console.warn('⚠️ Role creation warning:', roleError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher created successfully',
      teacher: {
        id: newUser.user.id,
        email: email,
        full_name: full_name,
        user_type: 'teacher',
        qualifications: qualifications,
        specializations: specializations,
        courses_assigned: assignmentResults.filter(r => r.success).length,
        salary_per_hour: salary_per_hour,
        can_login_immediately: true
      },
      assignments: assignmentResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Teacher creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
