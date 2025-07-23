import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params
    const updates = await request.json()

    console.log('Updating user:', userId, 'with data:', updates)

    // Update profile in profiles table
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: updates.full_name,
        ic_number: updates.ic_number,
        phone: updates.phone,
        address: updates.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to update profile: ${profileError.message}`
        },
        { status: 500 }
      )
    }

    // Update email in auth.users if email changed
    if (updates.email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email: updates.email }
      )

      if (authError) {
        console.warn('Failed to update auth email:', authError)
        // Don't fail the entire update if just email update fails
      }
    }

    console.log('User updated successfully:', profileResult)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: profileResult?.[0]
    })

  } catch (error) {
    console.error('Update user error:', error)
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params

    console.log('Deleting user:', userId)

    // Delete from profiles table first
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to delete profile: ${profileError.message}`
        },
        { status: 500 }
      )
    }

    // Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth user deletion error:', authError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to delete auth user: ${authError.message}`
        },
        { status: 500 }
      )
    }

    console.log('User deleted successfully:', userId)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
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
