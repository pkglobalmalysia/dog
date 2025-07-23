import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const salaryData = await request.json()

    // Validate required fields
    if (!salaryData.teacher_id || !salaryData.month || !salaryData.year || 
        !salaryData.total_classes || !salaryData.total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: teacher_id, month, year, total_classes, and total_amount are required' },
        { status: 400 }
      )
    }

    // Check if salary record already exists for this month/year
    const { data: existingSalary } = await supabase
      .from('salary_payments_new')
      .select('id')
      .eq('teacher_id', salaryData.teacher_id)
      .eq('month', salaryData.month)
      .eq('year', salaryData.year)
      .single()

    if (existingSalary) {
      return NextResponse.json(
        { error: 'Salary record already exists for this month and year' },
        { status: 400 }
      )
    }

    // Create salary record
    const { data: newSalary, error: createError } = await supabase
      .from('salary_payments_new')
      .insert({
        teacher_id: salaryData.teacher_id,
        month: salaryData.month,
        year: salaryData.year,
        total_classes: salaryData.total_classes,
        total_amount: salaryData.total_amount,
        bonus_amount: salaryData.bonus_amount || 0,
        status: salaryData.status || 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Salary creation error:', createError)
      return NextResponse.json(
        { error: `Failed to create salary record: ${createError.message || createError.details || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Salary record added successfully',
      salary: newSalary
    })

  } catch (error) {
    console.error('Add salary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
