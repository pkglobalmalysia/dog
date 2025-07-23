const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createTableUsingManualInsert() {
  try {
    console.log('Testing table creation by attempting insert...')
    
    // Try to insert a record to see if table exists
    const { data, error } = await supabase
      .from('teacher_salaries')
      .insert({
        teacher_id: 'test-uuid',
        month: 1,
        year: 2024,
        total_classes: 10,
        total_amount: 1000.00,
        bonus_amount: 100.00,
        final_amount: 1100.00,
        status: 'pending',
        admin_notes: 'Test record'
      })

    if (error) {
      console.log('Table does not exist or other error:', error.message)
      
      // Try creating a simple version by inserting into an existing table structure
      console.log('Attempting to use student_payments structure...')
      
      const { data: testPayment, error: paymentError } = await supabase
        .from('student_payments')
        .select('*')
        .limit(1)
        
      if (paymentError) {
        console.log('Student payments error:', paymentError)
      } else {
        console.log('Student payments table structure available')
        console.log('Sample structure:', testPayment)
      }
    } else {
      console.log('Table exists and insert successful:', data)
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

createTableUsingManualInsert()
