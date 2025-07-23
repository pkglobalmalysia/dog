import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  console.log('🚀 Setting up admin features database schema...')
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create student_payments table
    const { data: paymentsTable, error: paymentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL,
          course_id UUID,
          amount DECIMAL(10,2) NOT NULL,
          receipt_image_url TEXT,
          payment_method TEXT DEFAULT 'bank_transfer',
          reference_number TEXT,
          status TEXT DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT NOW(),
          approved_at TIMESTAMP,
          approved_by UUID,
          rejection_reason TEXT,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // Create teacher_salaries table
    const { data: salariesTable, error: salariesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS teacher_salaries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID NOT NULL,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
          completed_classes INTEGER DEFAULT 0,
          bonus_per_class DECIMAL(10,2) DEFAULT 0,
          bonus_amount DECIMAL(10,2) DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          calculated_at TIMESTAMP DEFAULT NOW(),
          approved_at TIMESTAMP,
          paid_at TIMESTAMP,
          approved_by UUID,
          payment_method TEXT,
          payment_reference TEXT,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // Create lectures table
    const { data: lecturesTable, error: lecturesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS lectures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          course_id UUID,
          teacher_id UUID,
          scheduled_time TIMESTAMP NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          location TEXT,
          online_meeting_url TEXT,
          materials_url TEXT,
          max_students INTEGER,
          enrolled_students INTEGER DEFAULT 0,
          status TEXT DEFAULT 'scheduled',
          completion_notes TEXT,
          attendance_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          created_by UUID
        );
      `
    })

    // Create courses_enhanced table
    const { data: coursesTable, error: coursesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses_enhanced (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          long_description TEXT,
          teacher_id UUID,
          price DECIMAL(10,2) DEFAULT 0,
          currency TEXT DEFAULT 'MYR',
          max_students INTEGER DEFAULT 20,
          current_enrollment INTEGER DEFAULT 0,
          duration_weeks INTEGER,
          duration_hours INTEGER,
          start_date DATE,
          end_date DATE,
          schedule_days TEXT[],
          schedule_time TIME,
          location TEXT,
          online_meeting_url TEXT,
          prerequisites TEXT,
          learning_outcomes TEXT[],
          materials_included TEXT[],
          category TEXT,
          difficulty_level TEXT,
          language TEXT DEFAULT 'english',
          certification_provided BOOLEAN DEFAULT false,
          status TEXT DEFAULT 'active',
          featured BOOLEAN DEFAULT false,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          created_by UUID
        );
      `
    })

    // Create student_enrollments table
    const { data: enrollmentsTable, error: enrollmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_enrollments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL,
          course_id UUID NOT NULL,
          enrolled_at TIMESTAMP DEFAULT NOW(),
          enrollment_status TEXT DEFAULT 'active',
          payment_status TEXT DEFAULT 'pending',
          amount_due DECIMAL(10,2) DEFAULT 0,
          amount_paid DECIMAL(10,2) DEFAULT 0,
          payment_due_date DATE,
          progress_percentage INTEGER DEFAULT 0,
          completion_date DATE,
          grade TEXT,
          feedback TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          enrolled_by UUID
        );
      `
    })

    const results = {
      student_payments: !paymentsError,
      teacher_salaries: !salariesError,
      lectures: !lecturesError,
      courses_enhanced: !coursesError,
      student_enrollments: !enrollmentsError,
      errors: {
        payments: paymentsError?.message,
        salaries: salariesError?.message,
        lectures: lecturesError?.message,
        courses: coursesError?.message,
        enrollments: enrollmentsError?.message
      }
    }

    console.log('📊 Schema setup results:', results)

    return NextResponse.json({
      success: true,
      message: 'Admin features database schema setup initiated',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Schema setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
