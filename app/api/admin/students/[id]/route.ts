import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - Get single student
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: student, error } = await supabase
      .from('profiles')
      .select(`
        *,
        enrollments:student_enrollments(
          id,
          enrollment_status,
          payment_status,
          enrolled_at,
          course:courses_enhanced(*)
        ),
        payments:student_payments(*)
      `)
      .eq('id', resolvedParams.id)
      .eq('user_type', 'student')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// PUT - Update student
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const updates = await request.json()
    delete updates.id // Don't allow ID changes
    updates.updated_at = new Date().toISOString()

    const { data: student, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', resolvedParams.id)
      .eq('user_type', 'student')
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
