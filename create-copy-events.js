// Manually create events by copying the existing structure exactly
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

async function createExactCopyEvents() {
  console.log('📅 Creating Events by Copying Existing Structure\n');
  
  // Get the existing event structure
  const { data: existingEvent } = await supabase
    .from('calendar_events')
    .select('*')
    .limit(1)
    .single();
    
  if (!existingEvent) {
    console.log('❌ No existing events to copy from');
    return;
  }
  
  console.log('Using existing event as template:', existingEvent.title);
  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Create events with same structure but different times
  const events = [
    {
      title: "Today's Class - Copy Test",
      description: "Test class for today", 
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
      course_id: existingEvent.course_id,
      teacher_id: existingEvent.teacher_id,
      event_type: existingEvent.event_type,
      all_day: existingEvent.all_day,
      color: existingEvent.color,
      payment_amount: existingEvent.payment_amount,
      created_by: existingEvent.created_by
    },
    {
      title: "Tomorrow's Class - Copy Test",
      description: "Test class for tomorrow",
      start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
      end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
      course_id: existingEvent.course_id,
      teacher_id: existingEvent.teacher_id,
      event_type: existingEvent.event_type,
      all_day: existingEvent.all_day,
      color: existingEvent.color,
      payment_amount: existingEvent.payment_amount,
      created_by: existingEvent.created_by
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

createExactCopyEvents().then(() => {
  console.log('\n✅ Copy-based event creation complete');
}).catch(error => {
  console.error('❌ Copy-based event creation failed:', error);
});
