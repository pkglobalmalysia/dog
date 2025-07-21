// Check existing event timing and update it to be testable
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

async function fixExistingEvent() {
  console.log('🔧 Fixing Existing Events for Testing\n');
  
  const now = new Date();
  console.log('Current time:', now.toISOString());
  console.log('Current time (local):', now.toString());
  
  // Get existing events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('event_type', 'class');
    
  console.log(`\n📅 Found ${events?.length || 0} class events:`);
  events?.forEach((event, i) => {
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    const isPast = endTime < now;
    const isFuture = startTime > now;
    const isCurrent = !isPast && !isFuture;
    
    console.log(`${i+1}. ${event.title}`);
    console.log(`   Start: ${event.start_time} (${startTime.toString()})`);
    console.log(`   End: ${event.end_time} (${endTime.toString()})`);
    console.log(`   Status: ${isPast ? '✅ Past (can mark complete)' : isFuture ? '🔮 Future (cannot mark complete)' : '⏰ Current (can mark complete)'}`);
    console.log(`   ID: ${event.id}\n`);
  });
  
  if (events && events.length > 0) {
    const event = events[0];
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    if (startTime > now) {
      console.log('🔧 Event is in the future, updating to make it testable...');
      
      // Update event to have ended 30 minutes ago
      const newEndTime = new Date(now.getTime() - (30 * 60 * 1000)); // 30 minutes ago
      const newStartTime = new Date(newEndTime.getTime() - (60 * 60 * 1000)); // 1.5 hours ago
      
      const { data: updatedEvent, error } = await supabase
        .from('calendar_events')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          title: event.title + ' - UPDATED FOR TESTING'
        })
        .eq('id', event.id)
        .select()
        .single();
        
      if (error) {
        console.log(`❌ Update failed: ${error.message}`);
      } else {
        console.log(`✅ Event updated successfully!`);
        console.log(`   New start: ${updatedEvent.start_time}`);
        console.log(`   New end: ${updatedEvent.end_time}`);
        console.log(`   Title: ${updatedEvent.title}`);
        
        console.log('\n🎯 This event should now allow "Mark Complete" button to work');
      }
    } else if (endTime < now) {
      console.log('✅ Event has already ended - "Mark Complete" should work');
    } else {
      console.log('⏰ Event is currently in progress - "Mark Complete" should work');
    }
  }
  
  // Also check existing lecture
  console.log('\n📖 Checking existing lectures...');
  const { data: lectures } = await supabase
    .from('lectures')
    .select(`
      *,
      lecture_attendance(id, status, teacher_id)
    `);
    
  console.log(`Found ${lectures?.length || 0} lectures:`);
  lectures?.forEach((lecture, i) => {
    const lectureDate = new Date(lecture.date);
    const isPast = lectureDate < now;
    
    console.log(`${i+1}. ${lecture.title}`);
    console.log(`   Date: ${lecture.date} (${lectureDate.toString()})`);
    console.log(`   Status: ${isPast ? '✅ Past' : '🔮 Future'}`);
    console.log(`   Attendance records: ${lecture.lecture_attendance?.length || 0}`);
    if (lecture.lecture_attendance?.length > 0) {
      lecture.lecture_attendance.forEach(att => {
        console.log(`      - Teacher ${att.teacher_id}: ${att.status}`);
      });
    }
    console.log(`   ID: ${lecture.id}\n`);
  });
}

async function createSimpleLecture() {
  console.log('📖 Creating a simple lecture for testing...');
  
  const teacherId = '03eef332-2c31-4b32-bae6-352f0c17c947';
  const courseId = 'd15b4a34-a15b-441c-849c-619372f0ed51';
  const now = new Date();
  
  // Create a lecture that ended 30 minutes ago
  const lectureDate = new Date(now.getTime() - (30 * 60 * 1000));
  
  const { data: newLecture, error } = await supabase
    .from('lectures')
    .insert({
      title: 'Test Lecture - Can Mark Complete',
      description: 'This lecture just ended and can be marked complete',
      date: lectureDate.toISOString(),
      course_id: courseId
    })
    .select()
    .single();
    
  if (error) {
    console.log(`❌ Lecture creation failed: ${error.message}`);
  } else {
    console.log(`✅ Created lecture: ${newLecture.title}`);
    console.log(`   ID: ${newLecture.id}`);
    console.log(`   Date: ${newLecture.date}`);
    console.log('\n🎯 This lecture should show in teacher lectures page');
  }
}

fixExistingEvent()
  .then(() => createSimpleLecture())
  .then(() => {
    console.log('\n🎉 Event fixing complete!');
    console.log('\n📋 Now test:');
    console.log('1. Teacher Calendar: http://localhost:3003/dashboard/teacher/calendar');
    console.log('   - Should see updated event with "Mark Complete" button enabled');
    console.log('2. Teacher Lectures: http://localhost:3003/dashboard/teacher/lectures');
    console.log('   - Should see the test lecture');
    console.log('3. Try marking events/lectures as complete');
    console.log('4. Check admin salary management to see if completions show up');
  })
  .catch(error => {
    console.error('❌ Event fixing failed:', error);
  });
