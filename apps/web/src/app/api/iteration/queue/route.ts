import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { problem_description, initial_question, priority = 'normal' } = body;

    if (!problem_description || !initial_question) {
      return NextResponse.json(
        { error: 'problem_description and initial_question are required' },
        { status: 400 }
      );
    }

    // Queue the problem for processing
    const { data: queueItem, error } = await supabase
      .from('iteration_queue')
      .insert({
        problem_description,
        initial_question,
        priority,
        status: 'queued',
      })
      .select()
      .single();

    if (error) {
      // Table might not exist, create session directly
      const { data: session } = await supabase
        .from('iteration_sessions')
        .insert({
          problem_description,
          initial_question,
          status: 'queued',
          current_level: 1,
          current_iteration: 1,
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        session_id: session?.id,
        status: 'queued',
        message: 'Problem queued for processing',
      });
    }

    return NextResponse.json({
      success: true,
      queue_id: queueItem.id,
      status: 'queued',
      message: 'Problem queued for processing',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: sessions } = await supabase
      .from('iteration_sessions')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(50);

    return NextResponse.json({
      queued: sessions?.length || 0,
      sessions: sessions || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


