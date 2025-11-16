import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, handleTursoError } from '@/lib/turso';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const { idea, category, submitted_by } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'idea is required' },
        { status: 400 }
      );
    }

    const ideaId = randomUUID();
    const now = new Date().toISOString();

    // Store idea
    await turso.execute({
      sql: `INSERT INTO audit_logs (id, department_id, agent_id, action, resource_type, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        ideaId,
        'ideas',
        submitted_by || 'user',
        'idea_submitted',
        'idea',
        ideaId,
        JSON.stringify({
          idea,
          category: category || 'feature',
          status: 'pending_brainstorm',
          submitted_by: submitted_by || 'user',
        }),
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      idea_id: ideaId,
      idea,
      message: 'Idea submitted for brainstorming',
    });
  } catch (error: any) {
    const handled = handleTursoError(error);
    return NextResponse.json(
      { error: handled.error || 'Internal server error' },
      { status: handled.code || 500 }
    );
  }
}
