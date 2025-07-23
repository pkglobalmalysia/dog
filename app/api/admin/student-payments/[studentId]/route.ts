import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin Supabase client with service role key for admin operations
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

// GET - Get payments for a specific student
export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const resolvedParams = await params
  
  console.log('💰 Fetching payments for student:', resolvedParams.studentId)
  
  try {
    // Use admin client to get student payments (bypasses RLS)
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('student_payments')
      .select('*')
      .eq('student_id', resolvedParams.studentId)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.log('⚠️ Student payments table error:', paymentsError.message)
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        message: 'Payment system not yet set up. Payment tables will be created when needed.'
      })
    }

    console.log('✅ Student payments fetched successfully:', payments?.length || 0)

    // Format the payments data for the frontend
    const formattedPayments = payments?.map((payment: any) => ({
      id: payment.id,
      student_id: payment.student_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      receipt_url: payment.receipt_url,
      created_at: payment.created_at,
      admin_notes: payment.admin_notes,
      approved_at: payment.approved_at,
      approved_by: payment.approved_by
    })) || []

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      total: payments?.length || 0
    })

  } catch (error) {
    console.error('❌ Student payments API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
