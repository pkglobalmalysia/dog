import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Service client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Fetch all active courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        scheduled_time,
        teacher_id,
        status,
        max_students,
        created_at,
        profiles(full_name),
        enrollments(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedCourses = (courses || []).map((course) => {
      const teacherProfile = Array.isArray(course.profiles) ? course.profiles[0] : course.profiles
      const enrollmentCount = Array.isArray(course.enrollments) ? course.enrollments.length : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        teacher_name: teacherProfile?.full_name || 'No Teacher Assigned',
        scheduled_time: course.scheduled_time,
        student_count: enrollmentCount,
        max_students: course.max_students || 30,
        status: course.status || 'active',
        created_at: course.created_at,
      }
    })

    return NextResponse.json({ 
      success: true, 
      courses: formattedCourses,
      count: formattedCourses.length 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/courses - Create a new course and corresponding calendar events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields for course creation
    if (!body.title || !body.teacher_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, teacher_id' },
        { status: 400 }
      );
    }
    
    // Create the course first
    const courseData = {
      title: body.title,
      description: body.description || '',
      teacher_id: body.teacher_id,
      scheduled_time: body.scheduled_time || body.start_time || new Date().toISOString(), // Fix null constraint
      max_students: body.max_students || 20,
      status: body.status || 'active'
    };
    
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    
    if (courseError) {
      console.error('Error creating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to create course', details: courseError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Course created:', course);
    
    // Create calendar events for the course if schedule information is provided
    const createdEvents = [];
    
    if (body.schedule && Array.isArray(body.schedule)) {
      console.log('📅 Creating calendar events for course schedule...');
      
      for (const scheduleItem of body.schedule) {
        if (scheduleItem.start_time && scheduleItem.end_time) {
          try {
            const eventData = {
              title: `${course.title} - Class Session`,
              description: `Course: ${course.title}\\n${course.description || ''}\\nCourse ID: ${course.id}`,
              event_type: 'class',
              teacher_id: course.teacher_id,
              start_time: scheduleItem.start_time,
              end_time: scheduleItem.end_time
            };
            
            const { data: event, error: eventError } = await supabaseAdmin
              .from('calendar_events')
              .insert([eventData])
              .select()
              .single();
            
            if (eventError) {
              console.error('Error creating calendar event:', eventError);
              // Continue with other events even if one fails
            } else {
              createdEvents.push(event);
              console.log('✅ Calendar event created:', event.title);
            }
            
          } catch (eventCreateError) {
            console.error('Exception creating calendar event:', eventCreateError);
            // Continue with other events
          }
        }
      }
    }
    
    // If no schedule provided but dates are given, create a single event
    else if (body.start_time && body.end_time) {
      console.log('📅 Creating single calendar event for course...');
      
      try {
        const eventData = {
          title: `${course.title} - Course`,
          description: `Course: ${course.title}\\n${course.description || ''}\\nCourse ID: ${course.id}`,
          event_type: 'class',
          teacher_id: course.teacher_id,
          start_time: body.start_time,
          end_time: body.end_time
        };
        
        const { data: event, error: eventError } = await supabaseAdmin
          .from('calendar_events')
          .insert([eventData])
          .select()
          .single();
        
        if (eventError) {
          console.error('Error creating calendar event:', eventError);
        } else {
          createdEvents.push(event);
          console.log('✅ Calendar event created:', event.title);
        }
        
      } catch (eventCreateError) {
        console.error('Exception creating calendar event:', eventCreateError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: course,
      calendar_events: createdEvents,
      events_created: createdEvents.length
    }, { status: 201 });
    
  } catch (error) {
    console.error('Exception in POST /api/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
