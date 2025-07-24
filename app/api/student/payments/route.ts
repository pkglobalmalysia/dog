import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const amount = formData.get('amount') as string
    const course_id = formData.get('course_id') as string
    const receipt_file = formData.get('receipt_file') as File

    if (!amount || !receipt_file) {
      return NextResponse.json({ 
        error: 'Amount and receipt file are required' 
      }, { status: 400 })
    }

    // Upload receipt file to Supabase storage
    const fileName = `receipt-${session.user.id}-${Date.now()}.${receipt_file.name.split('.').pop()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, receipt_file)

    if (uploadError) {
      console.error('Receipt upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload receipt: ' + uploadError.message 
      }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(fileName)

    // Get the student's enrollment for this course (if course_id provided)
    let enrollment_id = null;
    if (course_id) {
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('student_id', session.user.id)
        .eq('course_id', course_id)
        .single();
      
      if (enrollment) {
        enrollment_id = enrollment.id;
      }
    }

    // Create payment record with both student_id and enrollment_id
    const { data: paymentData, error: paymentError } = await supabase
      .from('student_payments')
      .insert({
        student_id: session.user.id,        // Direct student reference
        enrollment_id: enrollment_id,       // Enrollment reference (if course specified)
        course_id: course_id || null,       // Direct course reference
        amount: parseFloat(amount),
        receipt_url: publicUrl,
        payment_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ 
        error: 'Failed to create payment record: ' + paymentError.message 
      }, { status: 500 })
    }

    console.log('Payment submitted successfully:', paymentData)

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully! It will be reviewed by admin.',
      payment: paymentData[0]
    })

  } catch (error) {
    console.error('Payment submission error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch user's payment history using direct student_id reference
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select(`
        *,
        courses(title)
      `)
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Failed to fetch payments:', paymentsError)
      return NextResponse.json({ 
        error: 'Failed to fetch payments: ' + paymentsError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payments: payments || []
    })

  } catch (error) {
    console.error('Fetch payments error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
