import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { teacherId } = await params
    const updateData = await request.json()

    // Update teacher profile
    const { data: updatedTeacher, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: updateData.full_name,
        email: updateData.email,
        ic_number: updateData.ic_number,
        phone: updateData.phone,
        address: updateData.address,
        specializations: updateData.specializations,
        experience_years: updateData.experience_years,
        updated_at: new Date().toISOString()
      })
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .select()
      .single()

    if (updateError) {
      console.error('Teacher update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update teacher profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher profile updated successfully',
      teacher: updatedTeacher
    })

  } catch (error) {
    console.error('Update teacher API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
