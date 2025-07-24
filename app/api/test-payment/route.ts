import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the test student
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Try to insert a test payment record
    const testPayment = {
      student_id: session.user.id,
      course_id: null, // No specific course
      amount: 100.00,
      payment_method: 'online',
      payment_status: 'pending',
      receipt_url: 'https://example.com/test-receipt.jpg',
      admin_notes: 'Test payment for debugging',
      created_at: new Date().toISOString()
    }

    console.log('Attempting to insert test payment:', testPayment)

    const { data: paymentData, error: paymentError } = await supabase
      .from('student_payments')
      .insert(testPayment)
      .select()

    if (paymentError) {
      console.error('Test payment insertion error:', paymentError)
      return NextResponse.json({ 
        error: 'Failed to insert test payment',
        details: paymentError.message,
        code: paymentError.code,
        hint: paymentError.hint
      }, { status: 500 })
    }

    console.log('Test payment inserted successfully:', paymentData)

    return NextResponse.json({
      success: true,
      message: 'Test payment inserted successfully!',
      payment: paymentData[0],
      user_id: session.user.id
    })

  } catch (error) {
    console.error('Test payment API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
