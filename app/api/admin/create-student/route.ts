import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🧑‍🎓 Admin creating new student...')
  
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
      courses_to_enroll = []
    } = requestData

    console.log('📝 Creating student with email:', email)

    // 1. Create user in Supabase Auth using Admin API
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        user_type: 'student',
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
        user_type: 'student',
        created_by: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      // Try to cleanup the auth user if profile fails
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ 
        error: 'Failed to create student profile: ' + profileError.message 
      }, { status: 400 })
    }

    console.log('✅ Student profile created')

    // 3. Enroll student in courses if specified
    const enrollmentResults = []
    for (const courseId of courses_to_enroll) {
      const { data: course } = await supabase
        .from('courses_enhanced')
        .select('*')
        .eq('id', courseId)
        .single()

      if (course) {
        const { error: enrollError } = await supabase
          .from('student_enrollments')
          .insert({
            student_id: newUser.user.id,
            course_id: courseId,
            enrollment_status: 'active',
            payment_status: 'pending',
            amount_due: course.price || 0,
            enrolled_by: session.user.id
          })

        enrollmentResults.push({
          course_id: courseId,
          course_title: course.title,
          success: !enrollError,
          error: enrollError?.message
        })
      }
    }

    console.log('✅ Course enrollments processed:', enrollmentResults.length)

    // 4. Create user role record
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'student',
        assigned_by: session.user.id,
        is_primary: true
      })

    if (roleError) {
      console.warn('⚠️ Role creation warning:', roleError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: newUser.user.id,
        email: email,
        full_name: full_name,
        user_type: 'student',
        courses_enrolled: enrollmentResults.filter(r => r.success).length,
        can_login_immediately: true
      },
      enrollments: enrollmentResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Student creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
