import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ salaryId: string }> }
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

    const { salaryId } = await params
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['pending', 'processing', 'paid', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update salary status
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    }

    // If marking as paid, set payment date
    if (status === 'paid') {
      updateData.payment_date = new Date().toISOString()
    }

    const { data: updatedSalary, error: updateError } = await supabase
      .from('salary_payments_new')
      .update(updateData)
      .eq('id', salaryId)
      .select()
      .single()

    if (updateError) {
      console.error('Salary status update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update salary status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Salary status updated to ${status}`,
      salary: updatedSalary
    })

  } catch (error) {
    console.error('Update salary status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
