import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAIClient, getAIModel } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const openai = createAIClient();
    const model = getAIModel();

    const body = await request.json();
    const { session_id, level, iteration } = body;

    if (!session_id || !level) {
      return NextResponse.json(
        { error: 'session_id and level are required' },
        { status: 400 }
      );
    }

    // Get session
    const { data: session } = await supabase
      .from('iteration_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get level configuration
    const { data: levelConfig } = await supabase
      .from('company_levels')
      .select('*')
      .eq('level_number', level)
      .single();

    if (!levelConfig) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    // Get previous best solution
    const { data: previousSteps } = await supabase
      .from('iteration_steps')
      .select('*')
      .eq('session_id', session_id)
      .eq('level', level - 1)
      .order('solution_score', { ascending: false })
      .limit(1);

    const previousSolution = previousSteps?.[0]?.output_data?.solution || session.initial_question;
    const previousScore = previousSteps?.[0]?.solution_score || 0;

    // Process each agent in this level
    const solutions: any[] = [];

    for (const department of levelConfig.departments) {
      // Simulate agent processing (in production, would call actual agent)
      const agentPrompt = `You are the ${department} agent at Level ${level}.

Previous solution: ${previousSolution}
Previous score: ${previousScore}

Problem: ${session.problem_description}

Provide your solution and score it (0-100). Return JSON with:
- solution: Your proposed solution
- score: Score (0-100)
- reasoning: Why this solution is better`;

      try {
        const completion = await openai.chat.completions.create({
          model: model, // Uses free Gemini by default, upgrade to premium when monetized
          messages: [
            { role: 'system', content: 'You are an AI agent solving problems. Return only valid JSON. Be concise.' },
            { role: 'user', content: agentPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 200, // Limit response length to reduce costs
        });

        const agentResponse = JSON.parse(completion.choices[0].message.content || '{}');

        // Store iteration step
        await supabase.from('iteration_steps').insert({
          session_id,
          level,
          iteration_number: iteration || 1,
          agent_id: department,
          agent_department: department,
          input_data: { previous_solution: previousSolution, previous_score: previousScore },
          output_data: agentResponse,
          solution_score: parseFloat(agentResponse.score) || 0,
        });

        solutions.push({
          agent: department,
          solution: agentResponse.solution || 'No solution provided',
          score: parseFloat(agentResponse.score) || 0,
          reasoning: agentResponse.reasoning || '',
        });
      } catch (error) {
        console.error(`Error processing ${department}:`, error);
      }
    }

    // Find best solution
    const bestSolution = solutions.reduce((best, current) => 
      current.score > best.score ? current : best,
      solutions[0] || { agent: 'none', solution: 'No solutions', score: 0 }
    );

    const improvement = bestSolution.score - previousScore;
    const shouldContinue = improvement >= 10 && bestSolution.score < 90 && level < 4;

    // Update session
    await supabase
      .from('iteration_sessions')
      .update({
        current_level: shouldContinue ? level + 1 : level,
        current_iteration: (iteration || 1) + 1,
        best_solution_score: bestSolution.score > session.best_solution_score ? bestSolution.score : session.best_solution_score,
        best_solution_text: bestSolution.score > session.best_solution_score ? bestSolution.solution : session.best_solution_text,
      })
      .eq('id', session_id);

    return NextResponse.json({
      level_complete: true,
      solutions,
      best_solution: bestSolution,
      previous_score: previousScore,
      improvement,
      next_level: shouldContinue ? level + 1 : level,
      should_continue: shouldContinue,
      status: shouldContinue ? 'continuing' : level === 4 ? 'completed' : 'stopped',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

