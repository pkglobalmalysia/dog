import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Admin Supabase client with service role key for user management
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

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, ic_number, phone, user_type } = await request.json()

    // Validate required fields
    if (!email || !full_name || !user_type || !ic_number) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, full_name, ic_number, and user_type are required' },
        { status: 400 }
      )
    }

    console.log('Creating auth user for:', email, 'type:', user_type)
    console.log('Form data received:', { email, full_name, ic_number, phone, user_type })

    // Create user with Supabase Auth using admin client with IC number as password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: ic_number, // Use IC number as password
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        user_type
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { success: false, error: `Failed to create authentication user: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create auth user - no user returned' },
        { status: 500 }
      )
    }

    console.log('Auth user created successfully:', authUser.user.id)

    // Prepare profile data - only include fields that exist in the profiles table
    const profileData: any = {
      id: authUser.user.id,
      email,
      full_name,
      role: user_type, // 'student' or 'teacher'
      approved: user_type === 'student' ? true : false, // Students auto-approved, teachers need approval
    }

    // Add optional fields only if they have values
    if (ic_number) {
      profileData.ic_number = ic_number
    }
    
    if (phone) {
      profileData.phone = phone
    }

    console.log('Creating profile with data:', profileData)

    // Try to create profile in profiles table, use upsert to handle cases where profile already exists
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      console.error('Profile error details:', JSON.stringify(profileError, null, 2))
      console.error('Profile data that failed:', profileData)
      
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create user profile: ${profileError.message}`,
          details: profileError.details || 'No additional details',
          hint: profileError.hint || 'Check table structure and RLS policies'
        },
        { status: 500 }
      )
    }

    console.log('Profile created successfully:', profileResult)

    return NextResponse.json({
      success: true,
      message: `${user_type === 'student' ? 'Student' : 'Teacher'} account created successfully! � Login credentials: Email: ${email}, Password: ${ic_number}`,
      user_id: authUser.user.id,
      profile_created: !!profileResult,
      login_info: {
        email,
        password: ic_number
      }
    })

  } catch (error) {
    console.error('Admin user creation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
