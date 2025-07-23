const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createSalaryTable() {
  try {
    console.log('Creating salary_payments_new table...')
    
    const { data, error } = await supabase.rpc('sql', {
      query: `
        -- Create salary_payments_new table for teacher salary management
        CREATE TABLE IF NOT EXISTS salary_payments_new (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
          year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
          total_classes INTEGER NOT NULL DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          bonus_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          final_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount + bonus_amount) STORED,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
          payment_date TIMESTAMP WITH TIME ZONE NULL,
          created_by UUID REFERENCES profiles(id),
          admin_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create unique constraint to prevent duplicate salary records for same teacher/month/year
        CREATE UNIQUE INDEX IF NOT EXISTS unique_teacher_salary_month_year 
        ON salary_payments_new (teacher_id, month, year);

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_salary_payments_teacher_id ON salary_payments_new (teacher_id);
        CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON salary_payments_new (status);
        CREATE INDEX IF NOT EXISTS idx_salary_payments_month_year ON salary_payments_new (month, year);

        -- Enable RLS (Row Level Security)
        ALTER TABLE salary_payments_new ENABLE ROW LEVEL SECURITY;
      `
    })

    if (error) {
      console.error('Error creating table:', error)
    } else {
      console.log('Table created successfully!')
    }

    // Create RLS policies
    console.log('Creating RLS policies...')
    
    const { data: policy1, error: policyError1 } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY IF NOT EXISTS "Admin can manage all salary payments" ON salary_payments_new
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      `
    })

    if (policyError1) {
      console.error('Error creating admin policy:', policyError1)
    } else {
      console.log('Admin policy created successfully!')
    }

    const { data: policy2, error: policyError2 } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY IF NOT EXISTS "Teachers can view their own salary payments" ON salary_payments_new
        FOR SELECT USING (
          teacher_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
      `
    })

    if (policyError2) {
      console.error('Error creating teacher policy:', policyError2)
    } else {
      console.log('Teacher policy created successfully!')
    }

    // Test table access
    console.log('Testing table access...')
    const { data: testData, error: testError } = await supabase
      .from('salary_payments_new')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('Error testing table:', testError)
    } else {
      console.log('Table test successful! Data:', testData)
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

createSalaryTable()
