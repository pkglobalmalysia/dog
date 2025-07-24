import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('🧪 Creating test payment data...')
    
    // Get current admin user
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get a student ID
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .limit(3)

    // Get a course ID
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .limit(3)

    if (!students || students.length === 0) {
      return NextResponse.json({ 
        error: 'No students found',
        message: 'Need at least one student to create test payments'
      }, { status: 400 })
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json({ 
        error: 'No courses found', 
        message: 'Need at least one course to create test payments'
      }, { status: 400 })
    }

    // Create test payment records
    const testPayments = [
      {
        student_id: students[0].id,
        course_id: courses[0]?.id || null,
        amount: 150.00,
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        admin_notes: 'Test payment - Bank Transfer',
        created_at: new Date().toISOString()
      },
      {
        student_id: students[1]?.id || students[0].id,
        course_id: courses[0]?.id || null,
        amount: 200.00,
        payment_method: 'cash',
        payment_status: 'approved',
        admin_notes: 'Test payment - Cash Payment (Approved)',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        student_id: students[2]?.id || students[0].id,
        course_id: courses[1]?.id || courses[0]?.id || null,
        amount: 100.00,
        payment_method: 'online',
        payment_status: 'pending',
        admin_notes: 'Test payment - Online Payment',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Insert the test payments
    const { data: insertedPayments, error: insertError } = await supabase
      .from('student_payments')
      .insert(testPayments)
      .select()

    if (insertError) {
      console.error('❌ Error inserting test payments:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create test payments',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('✅ Test payments created:', insertedPayments?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Created ${insertedPayments?.length || 0} test payment records`,
      payments: insertedPayments,
      students: students.map(s => ({ id: s.id, name: s.full_name, email: s.email })),
      courses: courses.map(c => ({ id: c.id, title: c.title }))
    })

  } catch (error) {
    console.error('❌ Test payments creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
