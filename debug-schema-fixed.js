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
  console.log('🔍 Checking Database Schema\n');
  
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
