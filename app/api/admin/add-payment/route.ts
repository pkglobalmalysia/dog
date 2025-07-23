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

export async function POST(request: Request) {
  console.log('✅ Admin adding manual payment...')
  
  try {
    const requestData = await request.json()
    const {
      student_id,
      amount,
      payment_method = 'cash',
      admin_notes,
      payment_status = 'approved'
    } = requestData

    console.log('📋 Manual payment details:', { student_id, amount, payment_method })

    // Validate required fields
    if (!student_id || !amount) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: student_id and amount are required' 
      }, { status: 400 })
    }

    // Insert payment using admin client (bypasses RLS)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('student_payments')
      .insert({
        student_id,
        amount: parseFloat(amount),
        payment_method,
        payment_status,
        admin_notes,
        created_at: new Date().toISOString(),
        approved_at: payment_status === 'approved' ? new Date().toISOString() : null,
        // Leave approved_by as null since it expects UUID and we don't have admin user context
        approved_by: null
      })
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Payment insertion error:', paymentError)
      return NextResponse.json({
        success: false,
        error: `Failed to add payment: ${paymentError.message}`,
        details: paymentError
      }, { status: 400 })
    }

    console.log('✅ Manual payment added successfully')

    return NextResponse.json({
      success: true,
      message: 'Payment added successfully',
      payment: {
        id: payment.id,
        student_name: payment.student?.full_name,
        student_email: payment.student?.email,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_status: payment.payment_status,
        admin_notes: payment.admin_notes,
        created_at: payment.created_at,
        approved_at: payment.approved_at
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Manual payment error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
