import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Current user ID:', session.user.id)
    console.log('Current user email:', session.user.email)

    // Check payments for this specific user (without courses join for now)
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select(`
        id,
        amount,
        receipt_url,
        payment_status,
        created_at,
        admin_notes,
        course_id,
        student_id
      `)
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false })

    // Also check all payments to compare
    const { data: allPayments } = await supabase
      .from('student_payments')
      .select(`
        id,
        student_id,
        amount,
        payment_status,
        course_id,
        created_at
      `)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      current_user: {
        id: session.user.id,
        email: session.user.email
      },
      user_payments: {
        count: payments?.length || 0,
        data: payments || [],
        error: paymentsError?.message || null
      },
      all_payments: {
        count: allPayments?.length || 0,
        data: allPayments || []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug student payments error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
