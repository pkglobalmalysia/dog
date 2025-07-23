import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('💰 Student submitting payment...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requestData = await request.json()
    const {
      course_id,
      payment_amount,
      payment_method,
      receipt_image_url,
      bank_reference,
      notes
    } = requestData

    console.log('📝 Processing payment for course:', course_id)

    // 1. Get course information
    const { data: course, error: courseError } = await supabase
      .from('courses_enhanced')
      .select('*')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ 
        error: 'Course not found: ' + (courseError?.message || 'Invalid course ID')
      }, { status: 404 })
    }

    // 2. Check if student is enrolled in this course
    const { data: enrollment } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('student_id', session.user.id)
      .eq('course_id', course_id)
      .single()

    if (!enrollment) {
      return NextResponse.json({ 
        error: 'You are not enrolled in this course'
      }, { status: 403 })
    }

    // 3. Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('student_payments')
      .insert({
        student_id: session.user.id,
        course_id: course_id,
        enrollment_id: enrollment.id,
        amount: parseFloat(payment_amount),
        payment_method: payment_method,
        receipt_image_url: receipt_image_url,
        bank_reference: bank_reference,
        notes: notes,
        payment_status: 'pending_approval',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Payment creation failed:', paymentError.message)
      return NextResponse.json({ 
        error: 'Failed to create payment record: ' + paymentError.message 
      }, { status: 400 })
    }

    console.log('✅ Payment record created:', payment.id)

    // 4. Update enrollment payment status
    const { error: enrollmentUpdateError } = await supabase
      .from('student_enrollments')
      .update({ 
        payment_status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollment.id)

    if (enrollmentUpdateError) {
      console.warn('⚠️ Enrollment update warning:', enrollmentUpdateError.message)
    }

    // 5. Get student profile for response
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully for admin approval',
      payment: {
        id: payment.id,
        student_name: profile?.full_name,
        student_email: profile?.email,
        course_title: course.title,
        amount: payment.amount,
        payment_method: payment.payment_method,
        receipt_url: payment.receipt_image_url,
        status: payment.payment_status,
        submitted_at: payment.submitted_at
      },
      next_steps: [
        'Admin will review your payment receipt',
        'You will receive notification once approved',
        'Course access will be activated upon approval'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Payment submission error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
