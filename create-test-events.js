// Create test calendar event for current teacher (whoever is logged in)
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

async function createTestEvents() {
  console.log('📅 Creating Test Calendar Events\n');
  
  // Get all teachers
  const { data: teachers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher');
    
  if (!teachers || teachers.length === 0) {
    console.log('❌ No teachers found');
    return;
  }
  
  console.log(`Found ${teachers.length} teachers`);
  
  // Create a test event for each teacher
  for (const teacher of teachers) {
    console.log(`\nCreating events for ${teacher.email}...`);
    
    // Create a course for this teacher if one doesn't exist
    let course;
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacher.id);
      
    if (existingCourses && existingCourses.length > 0) {
      course = existingCourses[0];
      console.log(`   Using existing course: ${course.title}`);
    } else {
      // Create a new course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: `Test Course for ${teacher.full_name}`,
          description: 'Test course created by debug script',
          teacher_id: teacher.id,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (courseError) {
        console.error(`   ❌ Error creating course: ${courseError.message}`);
        continue;
      }
      
      course = newCourse;
      console.log(`   ✅ Created new course: ${course.title}`);
    }
    
    // Create today's event
    const today = new Date();
    const todayEvent = {
      title: `Today's Test Class - ${teacher.full_name}`,
      description: `Test class for today`,
      event_type: 'class',
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
      teacher_id: teacher.id,
      course_id: course.id,
      created_at: new Date().toISOString()
    };
    
    const { data: todayEventData, error: todayError } = await supabase
      .from('calendar_events')
      .insert(todayEvent)
      .select()
      .single();
      
    if (todayError) {
      console.error(`   ❌ Error creating today's event: ${todayError.message}`);
    } else {
      console.log(`   ✅ Created today's event: ${todayEventData.title}`);
    }
    
    // Create tomorrow's event
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEvent = {
      title: `Tomorrow's Test Class - ${teacher.full_name}`,
      description: `Test class for tomorrow`,
      event_type: 'class',
      start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString(),
      end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
      teacher_id: teacher.id,
      course_id: course.id,
      created_at: new Date().toISOString()
    };
    
    const { data: tomorrowEventData, error: tomorrowError } = await supabase
      .from('calendar_events')
      .insert(tomorrowEvent)
      .select()
      .single();
      
    if (tomorrowError) {
      console.error(`   ❌ Error creating tomorrow's event: ${tomorrowError.message}`);
    } else {
      console.log(`   ✅ Created tomorrow's event: ${tomorrowEventData.title}`);
    }
  }
}

createTestEvents().then(() => {
  console.log('\n✅ Test event creation complete');
}).catch(error => {
  console.error('❌ Test event creation failed:', error);
});
