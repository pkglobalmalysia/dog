import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

// GET - Get single teacher
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: teacher, error } = await supabase
      .from('profiles')
      .select(`
        *,
        assigned_courses:courses_enhanced(
          id,
          title,
          description,
          price,
          status
        ),
        salary_info:teacher_salaries(
          id,
          hourly_rate,
          bank_account_name,
          bank_account_number,
          bank_name,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('id', resolvedParams.id)
      .eq('user_type', 'teacher')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, teacher })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// PUT - Update teacher
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const requestData = await request.json()
    
    // Separate profile updates from salary updates
    const { salary_info, ...profileUpdates } = requestData
    
    delete profileUpdates.id // Don't allow ID changes
    profileUpdates.updated_at = new Date().toISOString()

    // Update profile
    const { data: teacher, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', resolvedParams.id)
      .eq('user_type', 'teacher')
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to update teacher profile' }, { status: 400 })
    }

    // Update salary info if provided
    if (salary_info) {
      const { error: salaryError } = await supabase
        .from('teacher_salaries')
        .upsert({
          teacher_id: resolvedParams.id,
          ...salary_info,
          updated_at: new Date().toISOString()
        })

      if (salaryError) {
        console.warn('⚠️ Salary update warning:', salaryError.message)
      }
    }

    // Fetch updated teacher with all relations
    const { data: updatedTeacher } = await supabase
      .from('profiles')
      .select(`
        *,
        assigned_courses:courses_enhanced(*),
        salary_info:teacher_salaries(*)
      `)
      .eq('id', resolvedParams.id)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
