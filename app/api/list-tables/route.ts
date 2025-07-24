import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Use raw SQL query to get tables
    const { data: tables, error } = await supabase.rpc('list_tables', {})
    
    if (error) {
      // Fallback: try to get tables by checking common table names
      const tableNames = [
        'profiles', 'courses', 'student_payments', 'student_enrollments', 
        'teacher_salaries', 'assignments', 'assignments_submissions',
        'events', 'notifications'
      ]
      
      const tableInfo = []
      
      for (const tableName of tableNames) {
        try {
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (!countError) {
            tableInfo.push({
              name: tableName,
              schema: 'public',
              type: 'BASE TABLE',
              row_count: count || 0
            })
          }
        } catch (err) {
          // Table doesn't exist or no access
        }
      }
      
      return NextResponse.json({
        success: true,
        tables: tableInfo,
        total_tables: tableInfo.length,
        method: 'fallback',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      tables: tables || [],
      total_tables: tables?.length || 0,
      method: 'rpc',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database tables API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
