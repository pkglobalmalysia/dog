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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const resolvedParams = await params
  console.log('👤 Updating student profile:', resolvedParams.studentId)
  
  try {
    const requestData = await request.json()
    const {
      full_name,
      email,
      ic_number,
      phone,
      address,
      date_of_birth,
      emergency_contact
    } = requestData

    console.log('📋 Profile update data:', requestData)

    // Update user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        email,
        ic_number,
        phone,
        address,
        date_of_birth: date_of_birth || null,
        emergency_contact,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.studentId)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile update failed:', profileError.message)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update profile: ' + profileError.message 
      }, { status: 400 })
    }

    console.log('✅ Student profile updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully',
      profile,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Profile update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
