import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { problem_description, initial_question, max_iterations = 10, min_improvement = 10 } = body;

    if (!problem_description || !initial_question) {
      return NextResponse.json(
        { error: 'problem_description and initial_question are required' },
        { status: 400 }
      );
    }

    // Create iteration session
    const { data: session, error: sessionError } = await supabase
      .from('iteration_sessions')
      .insert({
        problem_description,
        initial_question,
        status: 'active',
        current_level: 1,
        current_iteration: 1,
        best_solution_score: 0,
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    // Get Level 1 agents
    const { data: level1 } = await supabase
      .from('company_levels')
      .select('departments')
      .eq('level_number', 1)
      .single();

    return NextResponse.json({
      session_id: session.id,
      status: 'active',
      current_level: 1,
      current_iteration: 1,
      agents_assigned: level1?.departments || ['post_team', 'storage', 'health_safety'],
      max_iterations,
      min_improvement,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


