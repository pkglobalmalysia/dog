// Check database schema for calendar_events table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  const envPath = path.join(__dirname, '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = value;
    }
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      supabaseKey = value;
    }
  });
} catch (error) {
  console.error('Error reading .env.local:', error);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('� Checking Database Schema\n');
  
  // Get existing calendar event to see its structure
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .limit(1);
    
  if (events && events.length > 0) {
    console.log('📋 Sample calendar_events record structure:');
    console.log(JSON.stringify(events[0], null, 2));
  }
  
  // Check what columns exist by trying different inserts
  console.log('\n🧪 Testing column requirements...');
  
  const testEvent = {
    title: 'TEST EVENT - DELETE ME',
    event_type: 'class',
    start_time: new Date().toISOString(),
    teacher_id: '03eef332-2c31-4b32-bae6-352f0c17c947'
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('calendar_events')
    .insert(testEvent)
    .select();
    
  if (insertError) {
    console.log('❌ Insert error:', insertError.message);
    console.log('Details:', insertError.details);
    console.log('Hint:', insertError.hint);
  } else {
    console.log('✅ Basic insert successful');
    if (insertData && insertData[0]) {
      console.log('Inserted record:', JSON.stringify(insertData[0], null, 2));
      
      // Clean up test record
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🗑️ Cleaned up test record');
    }
  }
}

checkSchema().then(() => {
  console.log('\n✅ Schema check complete');
}).catch(error => {
  console.error('❌ Schema check failed:', error);
});
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
