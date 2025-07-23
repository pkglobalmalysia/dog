import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - List all payments
export async function GET() {
  console.log('💰 Admin fetching all payments...')
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Simple query to get all payments with student and course info
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select(`
        *,
        profiles:student_id (
          id,
          full_name,
          email
        ),
        courses (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.log('⚠️ Payments table not found or empty:', paymentsError.message)
      // Return empty data instead of error
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        message: 'No payments table found or no payments available'
      })
    }

    console.log('✅ Payments fetched successfully:', payments?.length || 0)

    // Format the payments data according to Payment interface
    const formattedPayments = payments?.map((payment: any) => ({
      id: payment.id,
      student: {
        name: payment.profiles?.full_name || 'Unknown Student',
        email: payment.profiles?.email || 'No email'
      },
      course: {
        title: payment.courses?.title || 'General Payment'
      },
      payment: {
        amount: payment.amount || 0,
        status: payment.payment_status || 'pending',
        payment_method: payment.payment_method || 'receipt',
        created_at: payment.created_at,
        admin_notes: payment.admin_notes
      }
    })) || []

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      total: payments?.length || 0
    })

  } catch (error) {
    console.error('❌ Payments API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
