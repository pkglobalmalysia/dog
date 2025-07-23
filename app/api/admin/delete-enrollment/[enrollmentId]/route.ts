import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const resolvedParams = await params
  console.log('🗑️ Deleting enrollment:', resolvedParams.enrollmentId)
  
  try {
    // Delete enrollment
    const { error: deleteError } = await supabaseAdmin
      .from('student_enrollments')
      .delete()
      .eq('id', resolvedParams.enrollmentId)

    if (deleteError) {
      console.error('❌ Enrollment deletion failed:', deleteError.message)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to delete enrollment: ' + deleteError.message 
      }, { status: 400 })
    }

    console.log('✅ Enrollment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Enrollment deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
