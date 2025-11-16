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
    const { meeting_id, transcript, participants, agenda } = body;

    if (!meeting_id || !transcript) {
      return NextResponse.json(
        { error: 'meeting_id and transcript are required' },
        { status: 400 }
      );
    }

    // Generate minutes using AI
    const prompt = `Generate meeting minutes from this transcript:

Participants: ${participants?.join(', ') || 'Unknown'}
Agenda: ${agenda || 'Not specified'}

Transcript:
${transcript}

Provide structured minutes with:
1. Key Points Discussed
2. Decisions Made
3. Action Items (with owners)
4. Follow-ups Required
5. Next Steps

Format as JSON.`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are an expert minute-taker. Generate clear, structured meeting minutes in JSON format.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    let minutes;
    try {
      minutes = JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch {
      minutes = {
        key_points: response.choices[0]?.message?.content || 'Minutes generated',
        decisions: [],
        action_items: [],
        follow_ups: [],
        next_steps: [],
      };
    }

    // Store minutes
    const minutesId = randomUUID();
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        minutesId,
        'learning-dev-team',
        null,
        'meeting_minutes_generated',
        'minutes',
        minutesId,
        JSON.stringify({
          meeting_id,
          participants: participants || [],
          agenda: agenda || null,
          minutes,
          generated_at: new Date().toISOString(),
        }),
        new Date().toISOString(),
      ],
    });

    return NextResponse.json({
      success: true,
      minutes_id: minutesId,
      meeting_id,
      minutes,
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
