// Debug script to check calendar events
const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly from .env.local
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

async function debugCalendar() {
  console.log('🔍 Debugging Teacher Calendar Events\n');
  
  // 1. Check total calendar events
  const { data: allEvents, error: allError } = await supabase
    .from('calendar_events')
    .select('*');
    
  if (allError) {
    console.error('❌ Error fetching all events:', allError);
    return;
  }
  
  console.log(`📊 Total calendar events: ${allEvents.length}`);
  
  // 2. Check class events specifically
  const classEvents = allEvents.filter(e => e.event_type === 'class');
  console.log(`🎓 Class events: ${classEvents.length}`);
  
  // 3. Check teacher accounts
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('role', 'teacher');
    
  console.log(`👩‍🏫 Teachers in system: ${teachers?.length || 0}`);
  if (teachers) {
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.email} (${teacher.full_name}) - ID: ${teacher.id}`);
    });
  }
  
  // 4. Check events by teacher
  if (teachers && teachers.length > 0) {
    for (const teacher of teachers) {
      const teacherEvents = allEvents.filter(e => e.teacher_id === teacher.id);
      console.log(`   📅 ${teacher.email} has ${teacherEvents.length} events`);
      
      if (teacherEvents.length > 0) {
        teacherEvents.forEach(event => {
          console.log(`      - ${event.title} (${event.event_type}) on ${event.start_time}`);
        });
      }
    }
  }
  
  // 5. Check courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*');
    
  console.log(`📚 Courses in system: ${courses?.length || 0}`);
  if (courses) {
    courses.forEach(course => {
      console.log(`   - ${course.title} (Teacher ID: ${course.teacher_id})`);
    });
  }
  
  // 6. Show events by date ranges
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todayEvents = allEvents.filter(e => {
    const eventDate = new Date(e.start_time).toISOString().split('T')[0];
    return eventDate === todayStr;
  });
  
  const futureEvents = allEvents.filter(e => {
    const eventDate = new Date(e.start_time);
    return eventDate > today;
  });
  
  console.log(`📅 Today's events (${todayStr}): ${todayEvents.length}`);
  console.log(`🔮 Future events: ${futureEvents.length}`);
  
  if (todayEvents.length > 0) {
    console.log('Today\'s events:');
    todayEvents.forEach(event => {
      console.log(`   - ${event.title} at ${event.start_time} (Teacher: ${event.teacher_id})`);
    });
  }
  
  if (futureEvents.length > 0 && futureEvents.length <= 10) {
    console.log('Next few events:');
    futureEvents.slice(0, 10).forEach(event => {
      console.log(`   - ${event.title} at ${event.start_time} (Teacher: ${event.teacher_id})`);
    });
  }
}

debugCalendar().then(() => {
  console.log('\n✅ Debug complete');
}).catch(error => {
  console.error('❌ Debug failed:', error);
});
