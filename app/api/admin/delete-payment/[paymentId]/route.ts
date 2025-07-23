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
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const resolvedParams = await params
  console.log('🗑️ Deleting payment:', resolvedParams.paymentId)
  
  try {
    // Delete payment
    const { error: deleteError } = await supabaseAdmin
      .from('student_payments')
      .delete()
      .eq('id', resolvedParams.paymentId)

    if (deleteError) {
      console.error('❌ Payment deletion failed:', deleteError.message)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to delete payment: ' + deleteError.message 
      }, { status: 400 })
    }

    console.log('✅ Payment deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Payment deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
