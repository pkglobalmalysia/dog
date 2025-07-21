// Create events without the problematic total_amount field
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

async function createWorkingEvents() {
  console.log('📅 Creating Events Without Problematic Fields\n');
  
  // Get existing event to copy structure
  const { data: existingEvent } = await supabase
    .from('calendar_events')
    .select('*')
    .limit(1)
    .single();
    
  console.log('Using existing event structure:', JSON.stringify(existingEvent, null, 2));
  
  const teacher = { id: '03eef332-2c31-4b32-bae6-352f0c17c947' };
  const course = { id: 'd15b4a34-a15b-441c-849c-619372f0ed51' };
  const adminId = 'afdcceee-d75d-4050-bcf1-e0aa6a0d9e84';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Create events with same structure as existing event (no total_amount, no payment_amount)
  const events = [
    // Past event (completed yesterday)
    {
      title: 'Past Class - Completed Yesterday',
      description: 'This class was completed yesterday and should show in history',
      start_time: new Date(today.getTime() - (24 * 60 * 60 * 1000) + (9 * 60 * 60 * 1000)).toISOString(),
      end_time: new Date(today.getTime() - (24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)).toISOString(),
      course_id: course.id,
      teacher_id: teacher.id,
      event_type: 'class',
      created_by: adminId,
      all_day: false,
      color: '#10b981'
    },
    
    // Current/recent event (ended 30 minutes ago - can be marked complete)
    {
      title: 'Recent Class - Can Mark Complete',
      description: 'This class ended recently and can be marked as complete',
      start_time: new Date(now.getTime() - (90 * 60 * 1000)).toISOString(), // 1.5 hours ago
      end_time: new Date(now.getTime() - (30 * 60 * 1000)).toISOString(), // 30 minutes ago
      course_id: course.id,
      teacher_id: teacher.id,
      event_type: 'class',
      created_by: adminId,
      all_day: false,
      color: '#f59e0b'
    },
    
    // Future event today
    {
      title: 'Today Future Class - Later Today',
      description: 'This class is scheduled for later today',
      start_time: new Date(now.getTime() + (2 * 60 * 60 * 1000)).toISOString(), // 2 hours from now
      end_time: new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString(), // 3 hours from now
      course_id: course.id,
      teacher_id: teacher.id,
      event_type: 'class',
      created_by: adminId,
      all_day: false,
      color: '#3b82f6'
    },
    
    // Tomorrow's event
    {
      title: 'Tomorrow Class - Future Event',
      description: 'This class is scheduled for tomorrow morning',
      start_time: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)).toISOString(),
      end_time: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (11 * 60 * 60 * 1000)).toISOString(),
      course_id: course.id,
      teacher_id: teacher.id,
      event_type: 'class',
      created_by: adminId,
      all_day: false,
      color: '#8b5cf6'
    }
  ];
  
  const createdEvents = [];
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    console.log(`${i + 1}. Creating: ${event.title}...`);
    
    try {
      const { data: eventData, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
        
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.details) console.log(`   Details: ${error.details}`);
      } else {
        console.log(`   ✅ Created: ${eventData.title}`);
        console.log(`      ID: ${eventData.id}`);
        console.log(`      Time: ${eventData.start_time}`);
        createdEvents.push(eventData);
        
        // Create corresponding lecture
        try {
          const { data: lectureData, error: lectureError } = await supabase
            .from('lectures')
            .insert({
              title: event.title,
              description: event.description || '',
              date: event.start_time,
              course_id: event.course_id
            })
            .select()
            .single();
            
          if (lectureError) {
            console.log(`      ⚠️ Lecture creation failed: ${lectureError.message}`);
          } else {
            console.log(`      📖 Created lecture: ${lectureData.title} (ID: ${lectureData.id})`);
          }
        } catch (lectureErr) {
          console.log(`      ⚠️ Lecture creation error: ${lectureErr}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error}`);
    }
    
    console.log(); // Add spacing
  }
  
  console.log(`✅ Successfully created ${createdEvents.length} events\n`);
  
  // Now verify they show up correctly
  console.log('🔍 Verifying Event Creation...\n');
  
  // Check teacher calendar events
  const { data: teacherEvents } = await supabase
    .from('calendar_events')
    .select(`
      *,
      courses(title),
      teacher_class_attendance(id, status)
    `)
    .eq('teacher_id', teacher.id)
    .order('start_time');
    
  console.log(`📅 Teacher Calendar Events: ${teacherEvents?.length || 0}`);
  teacherEvents?.forEach((event, i) => {
    const startTime = new Date(event.start_time);
    const now = new Date();
    const timeStatus = startTime > now ? '🔮 Future' : startTime < new Date(now - 60*60*1000) ? '✅ Past' : '⏰ Current';
    console.log(`   ${i+1}. ${timeStatus} ${event.title}`);
    console.log(`      Time: ${event.start_time}`);
    console.log(`      Attendance: ${event.teacher_class_attendance?.[0]?.status || 'None'}`);
  });
  
  // Check lectures
  const { data: lectures } = await supabase
    .from('lectures')
    .select(`
      *,
      courses(title),
      lecture_attendance(id, status, teacher_id)
    `)
    .eq('course_id', course.id)
    .order('date');
    
  console.log(`\n📖 Lectures: ${lectures?.length || 0}`);
  lectures?.forEach((lecture, i) => {
    console.log(`   ${i+1}. ${lecture.title}`);
    console.log(`      Date: ${lecture.date}`);
    console.log(`      Attendance: ${lecture.lecture_attendance?.[0]?.status || 'None'}`);
  });
  
  return { createdEvents, teacherEvents, lectures };
}

createWorkingEvents()
  .then(({ createdEvents, teacherEvents, lectures }) => {
    console.log('\n🎉 Event Creation Complete!');
    console.log('\n📋 Summary:');
    console.log(`✅ Created ${createdEvents.length} new calendar events`);
    console.log(`📅 Teacher now has ${teacherEvents?.length || 0} total calendar events`);
    console.log(`📖 Course now has ${lectures?.length || 0} total lectures`);
    console.log('\n🧪 Next: Test the Teacher Dashboard');
    console.log('1. Visit: http://localhost:3003/dashboard/teacher/calendar');
    console.log('2. Visit: http://localhost:3003/dashboard/teacher/lectures');
    console.log('3. Try marking the "Recent Class" as complete');
  })
  .catch(error => {
    console.error('❌ Event creation failed:', error);
  });
