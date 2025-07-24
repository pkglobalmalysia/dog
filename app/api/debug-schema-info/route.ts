import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check student_payments table structure
    const { data: studentPaymentsColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'student_payments')
      .eq('table_schema', 'public')

    // Check courses table structure  
    const { data: coursesColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'courses')
      .eq('table_schema', 'public')

    // Try to get payments without the courses join
    const { data: paymentsWithoutJoin, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .order('created_at', { ascending: false })

    // Get all users for comparison
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')

    return NextResponse.json({
      success: true,
      schema_info: {
        student_payments_columns: studentPaymentsColumns,
        courses_columns: coursesColumns
      },
      payments_without_join: {
        count: paymentsWithoutJoin?.length || 0,
        data: paymentsWithoutJoin || [],
        error: paymentsError?.message || null
      },
      profiles: {
        count: profiles?.length || 0,
        data: profiles || []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug schema error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
