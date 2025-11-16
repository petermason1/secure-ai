import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { agent_id, title, description, mission_type, priority, target_value, deadline, reward } = body;

    if (!agent_id || !title || !description) {
      return NextResponse.json(
        { error: 'agent_id, title, and description are required' },
        { status: 400 }
      );
    }

    const missionId = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO bot_missions (
        id, agent_id, title, description, mission_type, status, priority, 
        progress, target_value, reward, created_at, deadline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        missionId,
        agent_id,
        title,
        description,
        mission_type || 'task',
        'active',
        priority || 'medium',
        0,
        target_value || null,
        reward || null,
        now,
        deadline || null,
      ],
    });

    return NextResponse.json({
      success: true,
      mission_id: missionId,
      mission: {
        id: missionId,
        agent_id,
        title,
        description,
        mission_type: mission_type || 'task',
        status: 'active',
        priority: priority || 'medium',
      },
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
