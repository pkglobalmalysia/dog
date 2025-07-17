const { createClient } = require('@supabase/supabase-js');

async function debugSchema() {
  console.log('🔍 Debugging database schema...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('\n📋 Checking available tables...');
    
    // Check if assignment_submissions table exists
    const { data: submissionsTest, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .limit(1);
    
    if (submissionsError) {
      console.log('❌ assignment_submissions table:', submissionsError.message);
      if (submissionsError.code === '42P01') {
        console.log('   → Table does not exist');
      }
    } else {
      console.log('✅ assignment_submissions table exists');
      console.log('   → Sample data:', submissionsTest);
    }
    
    // Check assignments table
    const { data: assignmentsTest, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id, title, course_id')
      .limit(3);
    
    if (assignmentsError) {
      console.log('❌ assignments table:', assignmentsError.message);
    } else {
      console.log('✅ assignments table exists');
      console.log('   → Sample assignments:', assignmentsTest);
    }
    
    // Check profiles table structure
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, submissions')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ profiles table:', profilesError.message);
    } else {
      console.log('✅ profiles table exists');
      console.log('   → Sample profile:', profilesTest);
      
      // Check if submissions column exists
      if (profilesTest.length > 0) {
        const profile = profilesTest[0];
        if ('submissions' in profile) {
          console.log('✅ profiles.submissions column exists');
        } else {
          console.log('❌ profiles.submissions column missing');
        }
      }
    }
    
    // Check courses table
    const { data: coursesTest, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(3);
    
    if (coursesError) {
      console.log('❌ courses table:', coursesError.message);
    } else {
      console.log('✅ courses table exists');
      console.log('   → Sample courses:', coursesTest);
    }
    
  } catch (error) {
    console.error('❌ Schema debug error:', error);
  }
}

debugSchema();
