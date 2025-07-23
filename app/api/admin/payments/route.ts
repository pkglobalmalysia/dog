import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('📋 Admin fetching pending payments...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('🔍 Fetching all student payments...')

    // Get all payments with student and course details
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select(`
        *,
        student:profiles!student_payments_student_id_fkey(
          id,
          full_name,
          email,
          phone,
          ic_number
        ),
        course:courses_enhanced!student_payments_course_id_fkey(
          id,
          title,
          description,
          price
        ),
        enrollment:student_enrollments!student_payments_enrollment_id_fkey(
          enrollment_status,
          enrolled_at
        )
      `)
      .order('submitted_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ Failed to fetch payments:', paymentsError.message)
      return NextResponse.json({ 
        error: 'Failed to fetch payments: ' + paymentsError.message 
      }, { status: 400 })
    }

    console.log('✅ Found', payments?.length || 0, 'payments')

    // Format payments data
    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      student: {
        id: payment.student?.id,
        name: payment.student?.full_name,
        email: payment.student?.email,
        phone: payment.student?.phone,
        ic_number: payment.student?.ic_number
      },
      course: {
        id: payment.course?.id,
        title: payment.course?.title,
        description: payment.course?.description,
        price: payment.course?.price
      },
      enrollment: {
        status: payment.enrollment?.enrollment_status,
        enrolled_at: payment.enrollment?.enrolled_at
      },
      payment: {
        amount: payment.amount,
        method: payment.payment_method,
        receipt_url: payment.receipt_image_url,
        bank_reference: payment.bank_reference,
        notes: payment.notes,
        status: payment.payment_status,
        submitted_at: payment.submitted_at,
        approved_at: payment.approved_at,
        approved_by: payment.approved_by,
        rejection_reason: payment.rejection_reason
      }
    })) || []

    // Group by payment status
    const groupedPayments = {
      pending_approval: formattedPayments.filter(p => p.payment.status === 'pending_approval'),
      approved: formattedPayments.filter(p => p.payment.status === 'approved'),
      rejected: formattedPayments.filter(p => p.payment.status === 'rejected'),
      all: formattedPayments
    }

    return NextResponse.json({
      success: true,
      message: 'Payments fetched successfully',
      payments: groupedPayments,
      summary: {
        total: formattedPayments.length,
        pending: groupedPayments.pending_approval.length,
        approved: groupedPayments.approved.length,
        rejected: groupedPayments.rejected.length,
        total_amount_pending: groupedPayments.pending_approval.reduce((sum, p) => sum + (p.payment.amount || 0), 0),
        total_amount_approved: groupedPayments.approved.reduce((sum, p) => sum + (p.payment.amount || 0), 0)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Payment fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
