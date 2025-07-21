import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/events - Fetch all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    const eventType = searchParams.get('event_type');
    
    let query = supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    const { data: events, error } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(events);
    
  } catch (error) {
    console.error('Exception in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valid event types that match the database constraint
    const VALID_EVENT_TYPES = ["class", "assignment", "exam", "payment", "holiday", "other"];
    
    // Validate required fields
    if (!body.title || !body.event_type || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, event_type, start_time, end_time' },
        { status: 400 }
      );
    }
    
    // Validate event type
    if (!VALID_EVENT_TYPES.includes(body.event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Debug: Log the incoming request body
    console.log('📝 Raw request body:', JSON.stringify(body, null, 2));
    
    // Prepare event data - remove ALL generated/computed fields and any problematic fields
    const { 
      total_amount, 
      created_at, 
      updated_at, 
      id, // Don't include ID in create
      ...eventData 
    } = body;
    
    // Silence unused variable warnings
    void total_amount;
    void created_at;
    void updated_at;
    void id;
    
    // Ensure we don't accidentally include total_amount or other generated fields
    delete eventData.total_amount;
    delete eventData.created_at;
    delete eventData.updated_at;
    delete eventData.id;
    
    // Debug: Log the cleaned data being sent to database
    console.log('📤 Data being sent to database:', JSON.stringify(eventData, null, 2));
    
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create event', details: error.message },
        { status: 500 }
      );
    }
    
    // For class events, create corresponding lecture
    if (event.event_type === 'class' && event.teacher_id) {
      try {
        const lectureData = {
          title: event.title,
          description: event.description,
          teacher_id: event.teacher_id,
          lecture_date: event.start_time,
          duration_minutes: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60))
        };
        
        const { error: lectureError } = await supabase
          .from('lectures')
          .insert([lectureData]);
          
        if (lectureError) {
          console.error('Warning: Failed to create corresponding lecture:', lectureError);
          // Don't fail the event creation if lecture creation fails
        }
      } catch (lectureErr) {
        console.error('Exception creating lecture:', lectureErr);
      }
    }
    
    return NextResponse.json(event, { status: 201 });
    
  } catch (error) {
    console.error('Exception in POST /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
