// Comprehensive admin event creation and testing script
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

async function adminCreateTestEvents() {
  console.log('👨‍💼 Admin Creating Comprehensive Test Events\n');
  
  // First, get teachers and courses
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('role', 'teacher');
    
  const { data: courses } = await supabase
    .from('courses')
    .select('*');
    
  const { data: students } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('role', 'student');
    
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();
  
  console.log(`📊 Found: ${teachers?.length || 0} teachers, ${courses?.length || 0} courses, ${students?.length || 0} students`);
  
  if (!teachers || teachers.length === 0 || !courses || courses.length === 0) {
    console.log('❌ Need at least 1 teacher and 1 course to create events');
    return;
  }
  
  const teacher = teachers[0];
  const course = courses[0];
  const adminId = admin?.id || teacher.id; // Use teacher as fallback creator
  
  console.log(`🎯 Using Teacher: ${teacher.email} (${teacher.full_name})`);
  console.log(`📚 Using Course: ${course.title}`);
  console.log(`👨‍💼 Creating as Admin: ${adminId}\n`);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Create comprehensive test events
  const events = [
    // 1. PAST EVENT (already completed) - for testing history
    {
      title: `Past Class - ${course.title}`,
      description: 'This class was completed yesterday',
      event_type: 'class',
      start_time: new Date(today.getTime() - (24 * 60 * 60 * 1000) + (9 * 60 * 60 * 1000)).toISOString(), // Yesterday 9 AM
      end_time: new Date(today.getTime() - (24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)).toISOString(), // Yesterday 10 AM
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#10b981'
    },
    
    // 2. CURRENT CLASS (happening now/soon) - for testing "mark complete"
    {
      title: `Current Class - ${course.title}`,
      description: 'This class is happening now or recently ended',
      event_type: 'class',
      start_time: new Date(today.getTime() + (now.getHours() - 1) * 60 * 60 * 1000).toISOString(), // 1 hour ago
      end_time: new Date(today.getTime() + now.getHours() * 60 * 60 * 1000).toISOString(), // Now
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#f59e0b'
    },
    
    // 3. TODAY'S FUTURE CLASS - for testing today's schedule
    {
      title: `Today's Future Class - ${course.title}`,
      description: 'This class is scheduled for later today',
      event_type: 'class',
      start_time: new Date(today.getTime() + (now.getHours() + 2) * 60 * 60 * 1000).toISOString(), // 2 hours from now
      end_time: new Date(today.getTime() + (now.getHours() + 3) * 60 * 60 * 1000).toISOString(), // 3 hours from now
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#3b82f6'
    },
    
    // 4. TOMORROW'S CLASS - for testing future events
    {
      title: `Tomorrow's Class - ${course.title}`,
      description: 'This class is scheduled for tomorrow',
      event_type: 'class',
      start_time: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (10 * 60 * 60 * 1000)).toISOString(), // Tomorrow 10 AM
      end_time: new Date(today.getTime() + (24 * 60 * 60 * 1000) + (11 * 60 * 60 * 1000)).toISOString(), // Tomorrow 11 AM
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#8b5cf6'
    },
    
    // 5. ASSIGNMENT DUE - for testing different event types
    {
      title: `Assignment Due - ${course.title}`,
      description: 'Students must submit their homework',
      event_type: 'assignment',
      start_time: new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(), // Day after tomorrow
      end_time: new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000)).toISOString(), // End of day
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#ef4444'
    },
    
    // 6. EXAM - for testing exam events
    {
      title: `Mid-term Exam - ${course.title}`,
      description: 'Important mid-term examination',
      event_type: 'exam',
      start_time: new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000) + (9 * 60 * 60 * 1000)).toISOString(), // Next week 9 AM
      end_time: new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000)).toISOString(), // Next week 12 PM
      teacher_id: teacher.id,
      course_id: course.id,
      created_by: adminId,
      all_day: false,
      color: '#dc2626'
    },
    
    // 7. HOLIDAY EVENT - for testing public events
    {
      title: 'Public Holiday',
      description: 'School closed for public holiday',
      event_type: 'holiday',
      start_time: new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString(), // 2 weeks from now
      end_time: new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000)).toISOString(),
      teacher_id: null, // Public event
      course_id: null,
      created_by: adminId,
      all_day: true,
      color: '#6b7280'
    }
  ];
  
  console.log('📅 Creating Events...\n');
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
        console.log(`   ✅ Created: ${eventData.title} (ID: ${eventData.id})`);
        createdEvents.push(eventData);
        
        // If it's a class event, also create corresponding lecture
        if (event.event_type === 'class') {
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
              console.log(`   ⚠️ Lecture creation failed: ${lectureError.message}`);
            } else {
              console.log(`   📖 Auto-created lecture: ${lectureData.title}`);
            }
          } catch (lectureErr) {
            console.log(`   ⚠️ Lecture creation error: ${lectureErr}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error}`);
    }
  }
  
  console.log(`\n✅ Successfully created ${createdEvents.length} events`);
  
  // Now test the events are visible in different dashboards
  console.log('\n🧪 Testing Event Visibility...\n');
  
  // Test 1: Check teacher calendar events
  console.log('1. Testing Teacher Calendar Events...');
  const { data: teacherEvents, error: teacherError } = await supabase
    .from('calendar_events')
    .select(`
      *,
      courses(title, live_class_url),
      teacher_class_attendance(id, status)
    `)
    .eq('teacher_id', teacher.id)
    .eq('event_type', 'class');
    
  if (teacherError) {
    console.log(`   ❌ Error fetching teacher events: ${teacherError.message}`);
  } else {
    console.log(`   ✅ Teacher can see ${teacherEvents?.length || 0} class events`);
    teacherEvents?.forEach(event => {
      console.log(`      - ${event.title} at ${event.start_time}`);
    });
  }
  
  // Test 2: Check teacher lectures
  console.log('\n2. Testing Teacher Lectures...');
  const { data: lectures, error: lectureError } = await supabase
    .from('lectures')
    .select(`
      *,
      courses(title, teacher_id),
      lecture_attendance(id, status, teacher_id)
    `)
    .eq('courses.teacher_id', teacher.id);
    
  if (lectureError) {
    console.log(`   ❌ Error fetching lectures: ${lectureError.message}`);
  } else {
    console.log(`   ✅ Teacher can see ${lectures?.length || 0} lectures`);
    lectures?.forEach(lecture => {
      console.log(`      - ${lecture.title} on ${lecture.date}`);
    });
  }
  
  // Test 3: Check student events
  console.log('\n3. Testing Student Event Visibility...');
  const { data: publicEvents, error: publicError } = await supabase
    .from('calendar_events')
    .select('*')
    .in('event_type', ['holiday', 'exam', 'assignment']);
    
  if (publicError) {
    console.log(`   ❌ Error fetching public events: ${publicError.message}`);
  } else {
    console.log(`   ✅ Students can see ${publicEvents?.length || 0} public events`);
    publicEvents?.forEach(event => {
      console.log(`      - ${event.title} (${event.event_type}) at ${event.start_time}`);
    });
  }
  
  return createdEvents;
}

async function testCrudOperations(events) {
  console.log('\n🔧 Testing CRUD Operations...\n');
  
  if (!events || events.length === 0) {
    console.log('❌ No events to test CRUD operations');
    return;
  }
  
  const testEvent = events[0];
  console.log(`🎯 Testing with event: ${testEvent.title}`);
  
  // Test READ
  console.log('\n1. Testing READ...');
  const { data: readEvent, error: readError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', testEvent.id)
    .single();
    
  if (readError) {
    console.log(`   ❌ READ failed: ${readError.message}`);
  } else {
    console.log(`   ✅ READ successful: ${readEvent.title}`);
  }
  
  // Test UPDATE
  console.log('\n2. Testing UPDATE...');
  const updatedTitle = `${testEvent.title} - UPDATED`;
  const { data: updateEvent, error: updateError } = await supabase
    .from('calendar_events')
    .update({ 
      title: updatedTitle,
      description: 'This event has been updated via CRUD test'
    })
    .eq('id', testEvent.id)
    .select()
    .single();
    
  if (updateError) {
    console.log(`   ❌ UPDATE failed: ${updateError.message}`);
  } else {
    console.log(`   ✅ UPDATE successful: ${updateEvent.title}`);
  }
  
  // Test DELETE (use the last event to avoid breaking other tests)
  const deleteEvent = events[events.length - 1];
  console.log(`\n3. Testing DELETE with: ${deleteEvent.title}`);
  
  const { error: deleteError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', deleteEvent.id);
    
  if (deleteError) {
    console.log(`   ❌ DELETE failed: ${deleteError.message}`);
  } else {
    console.log(`   ✅ DELETE successful`);
  }
  
  // Verify deletion
  const { data: verifyDelete } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', deleteEvent.id);
    
  if (verifyDelete && verifyDelete.length === 0) {
    console.log(`   ✅ DELETE verified - event no longer exists`);
  } else {
    console.log(`   ⚠️ DELETE verification failed - event still exists`);
  }
}

// Main execution
adminCreateTestEvents()
  .then(events => testCrudOperations(events))
  .then(() => {
    console.log('\n🎉 Admin Event Creation and Testing Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open teacher calendar: http://localhost:3003/dashboard/teacher/calendar');
    console.log('2. Open teacher lectures: http://localhost:3003/dashboard/teacher/lectures');
    console.log('3. Open student dashboard to verify visibility');
    console.log('4. Test marking classes complete');
    console.log('5. Test admin salary management to see completions');
  })
  .catch(error => {
    console.error('❌ Admin testing failed:', error);
  });
