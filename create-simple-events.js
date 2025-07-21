// Simple test to create events without problematic fields
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

async function createSimpleEvents() {
  console.log('📅 Creating Simple Test Events\n');
  
  const teacherId = '03eef332-2c31-4b32-bae6-352f0c17c947';
  const courseId = 'd15b4a34-a15b-441c-849c-619372f0ed51'; // From the existing event
  
  // Try creating with minimal fields first
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const events = [
    {
      title: `Today's Simple Test Class`,
      description: `Simple test class for today`,
      event_type: 'class',
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
      teacher_id: teacherId,
      course_id: courseId
    },
    {
      title: `Tomorrow's Simple Test Class`,
      description: `Simple test class for tomorrow`,
      event_type: 'class', 
      start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString(),
      end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
      teacher_id: teacherId,
      course_id: courseId
    }
  ];
  
  for (const event of events) {
    console.log(`Creating: ${event.title}...`);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();
      
    if (error) {
      console.log(`❌ Error creating ${event.title}:`, error.message);
      console.log('Details:', error.details);
    } else {
      console.log(`✅ Created: ${data.title} (ID: ${data.id})`);
    }
  }
}

createSimpleEvents().then(() => {
  console.log('\n✅ Simple event creation complete');
}).catch(error => {
  console.error('❌ Simple event creation failed:', error);
});
