import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ salaryId: string }> }
) {
  try {
    const { salaryId } = await params
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

    // Delete salary record
    const { error: deleteError } = await supabase
      .from('salary_payments_new')
      .delete()
      .eq('id', salaryId)

    if (deleteError) {
      console.error('Salary deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete salary record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Salary record deleted successfully'
    })

  } catch (error) {
    console.error('Delete salary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
