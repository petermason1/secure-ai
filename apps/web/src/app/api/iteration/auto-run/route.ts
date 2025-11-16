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
    const { problems } = body;

    // Default problems if none provided
    const defaultProblems = [
      {
        problem_description: 'How do we increase user engagement?',
        initial_question: 'What strategies will increase user engagement?',
      },
      {
        problem_description: 'How do we improve conversion rates?',
        initial_question: 'What changes will improve our conversion rates?',
      },
      {
        problem_description: 'How do we reduce customer churn?',
        initial_question: 'What can we do to reduce customer churn?',
      },
      {
        problem_description: 'How do we scale our operations?',
        initial_question: 'What is the best way to scale our operations?',
      },
      {
        problem_description: 'How do we improve our brand awareness?',
        initial_question: 'What strategies will improve brand awareness?',
      },
    ];

    const problemsToSolve = problems || defaultProblems;
    const results: any[] = [];

    for (const problem of problemsToSolve) {
      try {
        // Start iteration session
        const { data: session } = await supabase
          .from('iteration_sessions')
          .insert({
            problem_description: problem.problem_description,
            initial_question: problem.initial_question,
            status: 'active',
            current_level: 1,
            current_iteration: 1,
          })
          .select()
          .single();

        if (!session) continue;

        let currentLevel = 1;
        let currentIteration = 1;
        let bestScore = 0;
        let bestSolution = '';
        let maxIterations = 10;

        // Iterate through levels
        while (currentLevel <= 4 && currentIteration <= maxIterations) {
          // Get level config
          const { data: levelConfig } = await supabase
            .from('company_levels')
            .select('*')
            .eq('level_number', currentLevel)
            .single();

          if (!levelConfig) break;

          // Get previous solution
          const { data: previousSteps } = await supabase
            .from('iteration_steps')
            .select('*')
            .eq('session_id', session.id)
            .eq('level', currentLevel - 1)
            .order('solution_score', { ascending: false })
            .limit(1);

          const previousSolution =
            previousSteps?.[0]?.output_data?.solution || problem.initial_question;
          const previousScore = previousSteps?.[0]?.solution_score || 0;

          // Process each agent in level
          const solutions: any[] = [];

          for (const department of levelConfig.departments) {
            const agentPrompt = `You are the ${department} agent at Level ${currentLevel}.

Previous solution: ${previousSolution}
Previous score: ${previousScore}

Problem: ${problem.problem_description}

Provide your solution and score it (0-100). Return JSON with:
- solution: Your proposed solution
- score: Score (0-100)
- reasoning: Why this solution is better`;

            try {
              // Use cheaper model and shorter responses to reduce costs
              const completion = await openai.chat.completions.create({
                model: model, // Uses free Gemini by default, upgrade to premium when monetized
                messages: [
                  {
                    role: 'system',
                    content: 'You are an AI agent solving problems. Return only valid JSON. Be concise.',
                  },
                  { role: 'user', content: agentPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 200, // Limit response length to reduce costs
              });

              const agentResponse = JSON.parse(
                completion.choices[0].message.content || '{}'
              );

              await supabase.from('iteration_steps').insert({
                session_id: session.id,
                level: currentLevel,
                iteration_number: currentIteration,
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
              });
            } catch (error) {
              console.error(`Error processing ${department}:`, error);
            }
          }

          // Find best solution
          const best = solutions.reduce(
            (best, current) => (current.score > best.score ? current : best),
            solutions[0] || { agent: 'none', solution: 'No solutions', score: 0 }
          );

          const improvement = best.score - previousScore;

          // Update session
          await supabase
            .from('iteration_sessions')
            .update({
              current_level: currentLevel,
              current_iteration: currentIteration + 1,
              best_solution_score: best.score > bestScore ? best.score : bestScore,
              best_solution_text: best.score > bestScore ? best.solution : bestSolution,
            })
            .eq('id', session.id);

          bestScore = best.score > bestScore ? best.score : bestScore;
          bestSolution = best.score > bestScore ? best.solution : bestSolution;

          // Check stopping criteria
          if (best.score >= 90) {
            // Excellent solution found
            await supabase
              .from('iteration_sessions')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', session.id);
            break;
          }

          if (improvement < 10 && currentIteration >= 3) {
            // No improvement after 3 iterations
            if (currentLevel === 4) {
              await supabase
                .from('iteration_sessions')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', session.id);
              break;
            }
            // Move to next level
            currentLevel++;
            currentIteration = 1;
            continue;
          }

          if (improvement >= 10 && currentLevel < 4) {
            // Good improvement, move to next level
            currentLevel++;
            currentIteration = 1;
          } else {
            // Continue at same level
            currentIteration++;
          }
        }

        // Mark as completed if not already
        await supabase
          .from('iteration_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', session.id)
          .eq('status', 'active');

        results.push({
          problem: problem.problem_description,
          session_id: session.id,
          best_solution: bestSolution,
          best_score: bestScore,
          final_level: currentLevel,
          total_iterations: currentIteration,
          status: 'completed',
        });
      } catch (error) {
        console.error(`Error processing problem: ${problem.problem_description}`, error);
        results.push({
          problem: problem.problem_description,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      problems_processed: results.length,
      results,
      message: 'All iterations completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

