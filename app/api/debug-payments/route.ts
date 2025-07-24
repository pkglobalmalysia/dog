import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check student_payments table structure and data
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .order('created_at', { ascending: false })

    // Check profiles table to see students  
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'student')

    // Check courses table
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')

    return NextResponse.json({
      success: true,
      debug_info: {
        payments: {
          data: payments || [],
          count: payments?.length || 0,
          error: paymentsError?.message || null
        },
        students: {
          data: students || [],
          count: students?.length || 0,
          error: studentsError?.message || null
        },
        courses: {
          data: courses || [],
          count: courses?.length || 0,
          error: coursesError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug payments error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
