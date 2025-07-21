import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/events/[id] - Fetch a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: event, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(event);
    
  } catch (error) {
    console.error('Exception in GET /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _created_at, total_amount: _total_amount, ...updateData } = body;
    
    const { data: event, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(event);
    
  } catch (error) {
    console.error('Exception in PUT /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // First check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id, event_type, teacher_id, title')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      console.error('Error fetching event for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch event', details: fetchError.message },
        { status: 500 }
      );
    }
    
    // Delete corresponding lectures if it's a class event
    if (existingEvent.event_type === 'class' && existingEvent.teacher_id) {
      try {
        await supabase
          .from('lectures')
          .delete()
          .eq('teacher_id', existingEvent.teacher_id)
          .eq('title', existingEvent.title);
      } catch (lectureErr) {
        console.error('Warning: Failed to delete corresponding lectures:', lectureErr);
      }
    }
    
    // Delete the event
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' });
    
  } catch (error) {
    console.error('Exception in DELETE /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
