import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Admin Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  console.log('🔍 Testing database tables for enhanced student management...')
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Check if courses_enhanced table exists
    try {
      const { data: courses, error: coursesError } = await supabaseAdmin
        .from('courses_enhanced')
        .select('count')
        .limit(1)
      
      results.tests.push({
        test: 'courses_enhanced_table',
        status: coursesError ? 'MISSING' : 'EXISTS',
        error: coursesError?.message,
        details: coursesError ? 'Table not found' : `Table exists`
      })
    } catch (error) {
      results.tests.push({
        test: 'courses_enhanced_table',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Check if student_enrollments table exists
    try {
      const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
        .from('student_enrollments')
        .select('count')
        .limit(1)
      
      results.tests.push({
        test: 'student_enrollments_table',
        status: enrollmentsError ? 'MISSING' : 'EXISTS',
        error: enrollmentsError?.message,
        details: enrollmentsError ? 'Table not found' : `Table exists`
      })
    } catch (error) {
      results.tests.push({
        test: 'student_enrollments_table',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Check if student_payments table exists
    try {
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from('student_payments')
        .select('count')
        .limit(1)
      
      results.tests.push({
        test: 'student_payments_table',
        status: paymentsError ? 'MISSING' : 'EXISTS',
        error: paymentsError?.message,
        details: paymentsError ? 'Table not found' : `Table exists`
      })
    } catch (error) {
      results.tests.push({
        test: 'student_payments_table',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Check profiles table for new columns
    try {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('profile_picture_url, address')
        .limit(1)
      
      results.tests.push({
        test: 'profiles_table_enhanced',
        status: profilesError ? 'MISSING_COLUMNS' : 'ENHANCED',
        error: profilesError?.message,
        details: profilesError ? 'New columns not found' : `Enhanced columns exist`
      })
    } catch (error) {
      results.tests.push({
        test: 'profiles_table_enhanced',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 5: Test manual payment creation (what's actually failing)
    try {
      const testPayment = {
        student_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        amount: 100.00,
        payment_method: 'cash',
        payment_status: 'approved',
        admin_notes: 'Test payment for database validation'
      }

      const { data: paymentResult, error: paymentError } = await supabaseAdmin
        .from('student_payments')
        .insert(testPayment)
        .select()

      results.tests.push({
        test: 'manual_payment_creation',
        status: paymentError ? 'FAILED' : 'SUCCESS',
        error: paymentError?.message,
        details: paymentError ? `Payment creation failed: ${paymentError.message}` : 'Payment creation works'
      })

      // Clean up test payment if it was created
      if (paymentResult && paymentResult[0]) {
        await supabaseAdmin
          .from('student_payments')
          .delete()
          .eq('id', paymentResult[0].id)
      }
    } catch (error) {
      results.tests.push({
        test: 'manual_payment_creation',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Summary
    const missingTables = results.tests.filter((t: any) => t.status === 'MISSING' || t.status === 'FAILED').length
    const workingTests = results.tests.filter((t: any) => t.status === 'EXISTS' || t.status === 'SUCCESS').length

    results.summary = {
      total_tests: results.tests.length,
      working: workingTests,
      missing_or_failed: missingTables,
      database_ready: missingTables === 0,
      recommendation: missingTables > 0 ? 
        'Run setup-enhanced-student-management.sql to create missing tables' : 
        'Database is ready for enhanced student management'
    }

    console.log('✅ Database test completed:', results.summary)

    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      results
    })

  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Check database connection and run setup-enhanced-student-management.sql'
    }, { status: 500 })
  }
}
