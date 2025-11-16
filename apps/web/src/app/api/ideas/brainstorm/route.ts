import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { createAIClient, getAIModel } from '@/lib/openai-client';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI Gateway API key not configured' }, { status: 500 });
  }

  try {
    const turso = getTursoClient();
    const openai = createAIClient();
    const model = getAIModel();
    const body = await request.json();
    const { idea_id, idea } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'idea is required' },
        { status: 400 }
      );
    }

    // Get all ideation bots
    const ideationBots = [
      { id: 'junior-dev-ideas', name: 'Ideas Man Bot' },
      { id: 'junior-dev-wild', name: 'Wild Ideas Bot' },
      { id: 'junior-dev-random', name: 'Random Bot' },
      { id: 'junior-dev-research', name: 'Best Practices Researcher Bot' },
    ];

    const brainstormResults = [];

    // Have each bot brainstorm the idea
    for (const bot of ideationBots) {
      const prompt = `You are ${bot.name}. Brainstorm this idea:

"${idea}"

Provide:
1. Strengths of this idea
2. Potential improvements
3. Implementation considerations
4. Related ideas or variations
5. Potential challenges

Be creative and thorough!`;

      try {
        const response = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: `You are ${bot.name}, an expert at ideation and brainstorming.` },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1000,
        });

        brainstormResults.push({
          bot_id: bot.id,
          bot_name: bot.name,
          thoughts: response.choices[0]?.message?.content || 'No response',
        });
      } catch (error) {
        brainstormResults.push({
          bot_id: bot.id,
          bot_name: bot.name,
          thoughts: 'Error generating thoughts',
        });
      }
    }

    // Store brainstorm results
    const brainstormId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        brainstormId,
        'ideas',
        null,
        'idea_brainstormed',
        'idea',
        idea_id || brainstormId,
        JSON.stringify({
          idea,
          brainstorm_results: brainstormResults,
        }),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      idea,
      brainstorm_id: brainstormId,
      participants: ideationBots.length,
      results: brainstormResults,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
