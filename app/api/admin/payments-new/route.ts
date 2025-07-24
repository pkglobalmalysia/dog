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

    // First try to get payments without any joins
    const { data: paymentsBasic, error: basicError } = await supabase
      .from('student_payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (basicError) {
      console.log('⚠️ Basic payments query failed:', basicError.message)
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        message: 'No payments table found or no payments available'
      })
    }

    console.log('📊 Basic payments found:', paymentsBasic?.length || 0)

    // If we have no payments, return empty
    if (!paymentsBasic || paymentsBasic.length === 0) {
      return NextResponse.json({
        success: true,
        payments: [],
        total: 0,
        message: 'No payment records found'
      })
    }

    // Now try to enhance with student and course info
    const enhancedPayments = []
    
    for (const payment of paymentsBasic) {
      // Get student info
      let studentInfo = { name: 'Unknown Student', email: 'No email' }
      if (payment.student_id) {
        const { data: student } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', payment.student_id)
          .single()
        
        if (student) {
          studentInfo = {
            name: student.full_name || 'Unknown Student',
            email: student.email || 'No email'
          }
        }
      }

      // Get course info
      let courseInfo = { title: 'General Payment' }
      if (payment.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', payment.course_id)
          .single()
        
        if (course) {
          courseInfo = { title: course.title || 'General Payment' }
        }
      }

      enhancedPayments.push({
        id: payment.id,
        student: studentInfo,
        course: courseInfo,
        payment: {
          amount: payment.amount || 0,
          status: payment.payment_status || 'pending',
          payment_method: payment.payment_method || 'receipt',
          created_at: payment.created_at,
          admin_notes: payment.admin_notes,
          receipt_url: payment.receipt_url
        }
      })
    }

    console.log('✅ Enhanced payments ready:', enhancedPayments.length)

    return NextResponse.json({
      success: true,
      payments: enhancedPayments,
      total: enhancedPayments.length
    })

  } catch (error) {
    console.error('❌ Payments API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
