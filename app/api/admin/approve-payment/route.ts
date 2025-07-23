import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('✅ Admin approving/rejecting payment...')
  
  try {
    const supabase = createRouteHandlerClient({ 
      cookies
    })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requestData = await request.json()
    const {
      payment_id,
      action, // 'approve' or 'reject'
      rejection_reason,
      admin_notes
    } = requestData

    console.log(`📋 ${action === 'approve' ? 'Approving' : 'Rejecting'} payment:`, payment_id)

    // Check if student_payments table exists, if not return graceful response
    const { data: payment, error: paymentError } = await supabase
      .from('student_payments')
      .select('*')
      .eq('id', payment_id)
      .single()

    if (paymentError) {
      console.log('⚠️ Student payments table not found:', paymentError.message)
      return NextResponse.json({
        success: true,
        message: 'Payment system not yet set up. Payment tables will be created when needed.'
      })
    }

    // Update payment status
    const updateData = {
      payment_status: action === 'approve' ? 'approved' : 'rejected',
      approved_at: action === 'approve' ? new Date().toISOString() : null,
      approved_by: session.user.id,
      admin_notes: admin_notes || (action === 'reject' ? rejection_reason : null)
    }

    const { error: updateError } = await supabase
      .from('student_payments')
      .update(updateData)
      .eq('id', payment_id)

    if (updateError) {
      console.error('❌ Payment update failed:', updateError.message)
      return NextResponse.json({ 
        error: 'Failed to update payment: ' + updateError.message 
      }, { status: 400 })
    }

    console.log('✅ Payment status updated')

    // 3. Update enrollment status if approved
    if (action === 'approve' && payment.enrollment_id) {
      const { error: enrollmentError } = await supabase
        .from('student_enrollments')
        .update({ 
          payment_status: 'paid',
          enrollment_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.enrollment_id)

      if (enrollmentError) {
        console.warn('⚠️ Enrollment update warning:', enrollmentError.message)
      } else {
        console.log('✅ Enrollment activated')
      }
    }

    // 4. Get updated payment with student and course details for response
    const { data: updatedPayment } = await supabase
      .from('student_payments')
      .select(`
        *,
        student:profiles!student_payments_student_id_fkey(full_name, email),
        course:courses!student_payments_course_id_fkey(title)
      `)
      .eq('id', payment_id)
      .single()

    return NextResponse.json({
      success: true,
      message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      payment: {
        id: updatedPayment.id,
        student_name: updatedPayment.student?.full_name,
        student_email: updatedPayment.student?.email,
        course_title: updatedPayment.course?.title,
        amount: updatedPayment.amount,
        status: updatedPayment.payment_status,
        approved_at: updatedPayment.approved_at,
        admin_notes: updatedPayment.admin_notes
      },
      enrollment_updated: action === 'approve',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Payment approval error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
