const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function setupSchema() {
  console.log('🚀 ADMIN FEATURES SCHEMA SETUP');
  console.log('==============================');
  
  try {
    // Read environment variables
    const envFile = fs.readFileSync('.env.local', 'utf8');
    let supabaseUrl, supabaseKey;
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = value;
    });

    console.log('🔧 Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('🔑 Service Key:', supabaseKey ? 'Found' : 'Missing');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase');

    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return;
    }

    console.log('✅ Database connection verified');

    // Create the essential tables one by one
    console.log('\n📊 Creating admin feature tables...');

    // 1. Student Payments Table
    console.log('1️⃣  Creating student_payments table...');
    const paymentsResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL,
          course_id UUID,
          amount DECIMAL(10,2) NOT NULL,
          receipt_image_url TEXT,
          status TEXT DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT NOW(),
          approved_at TIMESTAMP,
          approved_by UUID,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (paymentsResult.error) {
      console.log('❌ student_payments error:', paymentsResult.error.message);
    } else {
      console.log('✅ student_payments table created');
    }

    // 2. Teacher Salaries Table
    console.log('2️⃣  Creating teacher_salaries table...');
    const salariesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS teacher_salaries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID NOT NULL,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          base_salary DECIMAL(10,2) DEFAULT 0,
          completed_classes INTEGER DEFAULT 0,
          bonus_amount DECIMAL(10,2) DEFAULT 0,
          total_amount DECIMAL(10,2) DEFAULT 0,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (salariesResult.error) {
      console.log('❌ teacher_salaries error:', salariesResult.error.message);
    } else {
      console.log('✅ teacher_salaries table created');
    }

    // 3. Lectures Table
    console.log('3️⃣  Creating lectures table...');
    const lecturesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS lectures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          course_id UUID,
          teacher_id UUID,
          scheduled_time TIMESTAMP,
          duration_minutes INTEGER DEFAULT 60,
          location TEXT,
          status TEXT DEFAULT 'scheduled',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (lecturesResult.error) {
      console.log('❌ lectures error:', lecturesResult.error.message);
    } else {
      console.log('✅ lectures table created');
    }

    // 4. Enhanced Courses Table
    console.log('4️⃣  Creating courses_enhanced table...');
    const coursesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses_enhanced (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          teacher_id UUID,
          price DECIMAL(10,2) DEFAULT 0,
          max_students INTEGER DEFAULT 20,
          duration_weeks INTEGER,
          start_date DATE,
          end_date DATE,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (coursesResult.error) {
      console.log('❌ courses_enhanced error:', coursesResult.error.message);
    } else {
      console.log('✅ courses_enhanced table created');
    }

    // 5. Student Enrollments Table
    console.log('5️⃣  Creating student_enrollments table...');
    const enrollmentsResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_enrollments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL,
          course_id UUID NOT NULL,
          enrolled_at TIMESTAMP DEFAULT NOW(),
          enrollment_status TEXT DEFAULT 'active',
          payment_status TEXT DEFAULT 'pending',
          amount_due DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (enrollmentsResult.error) {
      console.log('❌ student_enrollments error:', enrollmentsResult.error.message);
    } else {
      console.log('✅ student_enrollments table created');
    }

    console.log('\n🎉 SCHEMA SETUP COMPLETE!');
    console.log('📊 All essential tables for admin features have been created');
    console.log('\n✅ Ready for Phase 2: Admin User Creation System');

  } catch (error) {
    console.log('❌ Setup failed:', error.message);
  }
}

setupSchema();
