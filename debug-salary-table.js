// Debug script to check actual salary table structure
const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableStructure() {
  try {
    console.log('Checking salary_payments_new table structure...')
    
    // Try to get table structure by doing a simple select
    const { data, error } = await supabase
      .from('salary_payments_new')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error querying table:', error)
    } else {
      console.log('Sample data structure:', data)
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]))
      } else {
        console.log('Table is empty, but exists')
      }
    }
    
    // Also try to query PostgreSQL system tables for column info
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'salary_payments_new' })
    
    if (columnError) {
      console.log('Could not get column info via RPC:', columnError.message)
    } else {
      console.log('Column info:', columnInfo)
    }
    
  } catch (err) {
    console.error('Error:', err)
  }
}

checkTableStructure()
