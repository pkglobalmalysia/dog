import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // First check if student_payments table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%payment%')

    console.log('📋 Payment-related tables:', tables)

    // Check what columns exist in student_payments if it exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name_param: 'student_payments' })
      .single()

    console.log('� student_payments columns RPC result:', columns, columnsError)

    // Try direct query on student_payments
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .limit(1)

    console.log('💰 Direct student_payments query:', payments, paymentsError)

    // Try alternative query without foreign key
    const { data: paymentsSimple, error: paymentsSimpleError } = await supabase
      .from('student_payments')
      .select(`
        id,
        student_id,
        enrollment_id,
        amount,
        payment_method,
        payment_status,
        created_at,
        admin_notes,
        receipt_url
      `)
      .limit(5)

    console.log('� Simple student_payments query:', paymentsSimple, paymentsSimpleError)

    return NextResponse.json({
      paymentTables: tables,
      tablesError: tablesError?.message,
      directPayments: payments,
      directError: paymentsError?.message,
      simplePayments: paymentsSimple,
      simpleError: paymentsSimpleError?.message
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
